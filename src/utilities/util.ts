import cloneDeep from 'lodash.clonedeep';
import { parse, stringify } from 'query-string';
import {
  CycleYearData,
  PortfolioOptions,
  SimulationMethod,
  WithdrawalMethod
} from '../data/calc/portfolio-calc';

export interface DataColumns {
  cycleYear: number[];
  cycleStartYear: number[];
  cumulativeInflation: number[];
  balanceStart: number[];
  balanceInfAdjStart: number[];
  withdrawal: number[];
  withdrawalInfAdjust: number[];
  deposit: number[];
  depositInfAdjust: number[];
  startSubtotal: number[];
  equities: number[];
  equitiesGrowth: number[];
  dividendsGrowth: number[];
  bonds: number[];
  bondsGrowth: number[];
  endSubtotal: number[];
  fees: number[];
  balanceEnd: number[];
  balanceInfAdjEnd: number[];
}

export interface UrlQuery {
  simulationMethod: string;
  startBalance: string;
  equitiesRatio: string;
  investmentExpenseRatio: string;
  withdrawalMethod: string;
  withdrawalStaticAmount?: string;
  withdrawalPercent?: string;
  withdrawalFloor?: string;
  withdrawalCeiling?: string;
  simulationYearsLength: string;
  withdrawalStartIdx?: string;
  deposits?: string;
}

export const defaultPortfolioOptions: PortfolioOptions = {
  simulationMethod: 'Historical Data',
  startBalance: 1000000,
  equitiesRatio: 0.9,
  investmentExpenseRatio: 0.0025,
  withdrawalMethod: 1,
  withdrawal: {
    staticAmount: 40000,
    percentage: 0.04,
    floor: 30000,
    ceiling: 60000
  },
  simulationYearsLength: 60,
  deposits: []
};

/**
 * Create an object with an array of each column across all years for each cycle year
 * i.e. Condenses each cycle's array of cycleYear rows into 1 aggregate row per cycle
 * Used for cycle-level statistics
 */
export function pivotPortfolioCycles(
  portfolioLifecyclesData: CycleYearData[][]
): DataColumns[] {
  const portfolioYearDataColumns: DataColumns[] = [];
  portfolioLifecyclesData.map((cycleData) => {
    const yearDataColumns: DataColumns = {
      cycleYear: [],
      cycleStartYear: [],
      cumulativeInflation: [],
      balanceStart: [],
      balanceInfAdjStart: [],
      withdrawal: [],
      withdrawalInfAdjust: [],
      deposit: [],
      depositInfAdjust: [],
      startSubtotal: [],
      equities: [],
      equitiesGrowth: [],
      dividendsGrowth: [],
      bonds: [],
      bondsGrowth: [],
      endSubtotal: [],
      fees: [],
      balanceEnd: [],
      balanceInfAdjEnd: []
    };
    cycleData.map((yearData) => {
      for (const key in yearData) {
        if (yearData.hasOwnProperty(key)) {
          (yearDataColumns[key] as number[]).push(yearData[key]);
        }
      }
    });
    portfolioYearDataColumns.push(yearDataColumns);
  });
  return portfolioYearDataColumns;
}

/**
 * Create an object with an array of each column across all years of all cycle years
 * i.e. Condenses each cycle's array of cycleYear rows into 1 aggregate row for all cycles
 * Used to obtain cycle-level statistics of portfolio statistics and portfolio-level averages (average of averages not as accurate)
 * (e.g. maximum individual withdrawal amount year across all cycles)
 */
export function pivotPortfolioCyclesAggregate(
  portfolioLifecyclesData: CycleYearData[][]
): DataColumns {
  const portfolioCycleDataColumns: DataColumns = {
    cycleYear: [],
    cycleStartYear: [],
    cumulativeInflation: [],
    balanceStart: [],
    balanceInfAdjStart: [],
    withdrawal: [],
    withdrawalInfAdjust: [],
    deposit: [],
    depositInfAdjust: [],
    startSubtotal: [],
    equities: [],
    equitiesGrowth: [],
    dividendsGrowth: [],
    bonds: [],
    bondsGrowth: [],
    endSubtotal: [],
    fees: [],
    balanceEnd: [],
    balanceInfAdjEnd: []
  };
  portfolioLifecyclesData.map((cycleData) => {
    cycleData.map((yearData) => {
      for (const key in yearData) {
        if (yearData.hasOwnProperty(key)) {
          (portfolioCycleDataColumns[key] as number[]).push(yearData[key]);
        }
      }
    });
  });
  return portfolioCycleDataColumns;
}

export function queryStringToPortfolioOptions(
  queryString: string
): [PortfolioOptions, boolean] {
  const query = (parse(queryString) as unknown) as UrlQuery;
  let options = cloneDeep(defaultPortfolioOptions);
  let validatedOptionPresent = false;

  options.simulationMethod = query.simulationMethod as SimulationMethod;
  options.startBalance = parseInt(query.startBalance);
  options.equitiesRatio = parseFloat(query.equitiesRatio);
  options.investmentExpenseRatio = parseFloat(query.investmentExpenseRatio);
  options.simulationYearsLength = parseInt(query.simulationYearsLength);
  options.withdrawalMethod = parseInt(
    query.withdrawalMethod
  ) as WithdrawalMethod;
  options.withdrawal.startYearIdx = parseInt(query.withdrawalStartIdx);

  if (options.withdrawalMethod === WithdrawalMethod.InflationAdjusted) {
    options.withdrawal.staticAmount = parseInt(query.withdrawalStaticAmount);
  } else {
    options.withdrawal.percentage = parseFloat(query.withdrawalPercent);
  }

  if (options.withdrawalMethod === WithdrawalMethod.PercentPortfolioClamped) {
    options.withdrawal.floor = parseInt(query.withdrawalFloor);
    options.withdrawal.ceiling = parseInt(query.withdrawalCeiling);
  }

  if (query.deposits) {
    try {
      // We need to hint to JSON.parse that we're passing in a string
      // Oddly works without the hint in console but not in the app itself
      options.deposits = JSON.parse(query.deposits + '');
    } catch (error) {
      console.log('Url parse error', error);
    }
  }

  // Check if we have any valid options parsed from query, else reset them to default
  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      if (key === 'withdrawal' || key === 'deposits') continue;
      if (isNaN(options[key]) || typeof options[key] === 'undefined') {
        options[key] = defaultPortfolioOptions[key];
      } else {
        validatedOptionPresent = true;
      }
    }
  }

  if (options.withdrawalMethod !== WithdrawalMethod.InflationAdjusted) {
    for (const key in options.withdrawal) {
      if (options.withdrawal.hasOwnProperty(key)) {
        if (isNaN(options.withdrawal[key])) {
          options.withdrawal[key] = defaultPortfolioOptions.withdrawal[key];
        } else {
          validatedOptionPresent = true;
        }
      }
    }
  }

  if (validatedOptionPresent) return [options, true];
  else return [defaultPortfolioOptions, false];
}

export function portfolioOptionsToQueryString(
  options: PortfolioOptions
): string {
  const queryObj: UrlQuery = {
    simulationMethod: options.simulationMethod,
    startBalance: options.startBalance + '',
    equitiesRatio: options.equitiesRatio + '',
    investmentExpenseRatio: options.investmentExpenseRatio + '',
    withdrawalMethod: options.withdrawalMethod + '',
    simulationYearsLength: options.simulationYearsLength + ''
  };

  if (options.withdrawalMethod === WithdrawalMethod.InflationAdjusted) {
    queryObj.withdrawalStaticAmount = options.withdrawal.staticAmount + '';
  } else {
    queryObj.withdrawalPercent = options.withdrawal.percentage + '';
  }

  if (options.withdrawalMethod === WithdrawalMethod.PercentPortfolioClamped) {
    queryObj.withdrawalFloor = options.withdrawal.floor + '';
    queryObj.withdrawalCeiling = options.withdrawal.ceiling + '';
  }

  if (options.withdrawal.startYearIdx)
    queryObj.withdrawalStartIdx = options.withdrawal.startYearIdx + '';
  else queryObj.withdrawalStartIdx = '1';

  if (options.deposits && options.deposits.length) {
    queryObj.deposits = JSON.stringify(options.deposits);
    // let stringifiedDeposits = '';
    // for (let i = 0; i < options.deposits.length; i++) {
    //   const deposit = options.deposits[i];
    //   stringifiedDeposits += `startYearIdx:${deposit.startYearIdx}`
    // }
  }

  // @ts-ignore (this works fine, type defs seem insufficient)
  return stringify(queryObj);
}

/**
 * Debounces a function
 */
export function debounced(delay: number, fn: any) {
  let timerId: NodeJS.Timeout;
  return function (...args: any) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
}

// clsx function (conditional className construction)
function toVal(mix) {
  var k,
    y,
    str = '';

  if (typeof mix === 'string' || typeof mix === 'number') {
    str += mix;
  } else if (typeof mix === 'object') {
    if (Array.isArray(mix)) {
      for (k = 0; k < mix.length; k++) {
        if (mix[k]) {
          if ((y = toVal(mix[k]))) {
            str && (str += ' ');
            str += y;
          }
        }
      }
    } else {
      for (k in mix) {
        if (mix[k]) {
          str && (str += ' ');
          str += k;
        }
      }
    }
  }

  return str;
}

export function clsx(...args: any[]) {
  var i = 0,
    tmp,
    x,
    str = '';
  while (i < args.length) {
    if ((tmp = args[i++])) {
      if ((x = toVal(tmp))) {
        str && (str += ' ');
        str += x;
      }
    }
  }
  return str;
}
