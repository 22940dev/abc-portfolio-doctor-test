import { MarketYearData } from './calc/portfolio-calc';
import { parseCSVStringToJSON } from './data-helpers';

describe('data helpers', () => {
  test('data string CSVs parsed with headers', () => {
    const dataString =
      'Year, S&P Price , S&P Dividend , CPI ,Rate GS10\r2015,2028.18,39.89666667,233.707,1.88\n2016,1918.6,43.55333333,236.916,2.09\r\n2017,2275.12,45.92666667,242.839,2.43\r\n2018,2789.8,49.28666667,247.867,2.58';
    const expected: MarketYearData[] = [
      {
        year: 2015,
        equitiesPrice: 2028.18,
        equitiesDividend: 39.89666667,
        inflationIndex: 233.707,
        fixedIncomeInterest: 1.88
      },
      {
        year: 2016,
        equitiesPrice: 1918.6,
        equitiesDividend: 43.55333333,
        inflationIndex: 236.916,
        fixedIncomeInterest: 2.09
      },
      {
        year: 2017,
        equitiesPrice: 2275.12,
        equitiesDividend: 45.92666667,
        inflationIndex: 242.839,
        fixedIncomeInterest: 2.43
      },
      {
        year: 2018,
        equitiesPrice: 2789.8,
        equitiesDividend: 49.28666667,
        inflationIndex: 247.867,
        fixedIncomeInterest: 2.58
      }
    ];
    expect(parseCSVStringToJSON(dataString, true)).toEqual(expected);
  });

  test('data string CSVs parsed without headers', () => {
    const dataString =
      '2015,2028.18,39.89666667,233.707,1.88\r2016,1918.6,43.55333333,236.916,2.09\n2017,2275.12,45.92666667,242.839,2.43\r\n2018,2789.8,49.28666667,247.867,2.58';
    const expected: MarketYearData[] = [
      {
        year: 2015,
        equitiesPrice: 2028.18,
        equitiesDividend: 39.89666667,
        inflationIndex: 233.707,
        fixedIncomeInterest: 1.88
      },
      {
        year: 2016,
        equitiesPrice: 1918.6,
        equitiesDividend: 43.55333333,
        inflationIndex: 236.916,
        fixedIncomeInterest: 2.09
      },
      {
        year: 2017,
        equitiesPrice: 2275.12,
        equitiesDividend: 45.92666667,
        inflationIndex: 242.839,
        fixedIncomeInterest: 2.43
      },
      {
        year: 2018,
        equitiesPrice: 2789.8,
        equitiesDividend: 49.28666667,
        inflationIndex: 247.867,
        fixedIncomeInterest: 2.58
      }
    ];
    expect(parseCSVStringToJSON(dataString)).toEqual(expected);
  });

  test('data string CSVs parsed without headers discards trailing newline', () => {
    const dataString =
      '2015,2028.18,39.89666667,233.707,1.88\r2016,1918.6,43.55333333,236.916,2.09\n2017,2275.12,45.92666667,242.839,2.43\r\n2018,2789.8,49.28666667,247.867,2.58\r\n';
    const expected: MarketYearData[] = [
      {
        year: 2015,
        equitiesPrice: 2028.18,
        equitiesDividend: 39.89666667,
        inflationIndex: 233.707,
        fixedIncomeInterest: 1.88
      },
      {
        year: 2016,
        equitiesPrice: 1918.6,
        equitiesDividend: 43.55333333,
        inflationIndex: 236.916,
        fixedIncomeInterest: 2.09
      },
      {
        year: 2017,
        equitiesPrice: 2275.12,
        equitiesDividend: 45.92666667,
        inflationIndex: 242.839,
        fixedIncomeInterest: 2.43
      },
      {
        year: 2018,
        equitiesPrice: 2789.8,
        equitiesDividend: 49.28666667,
        inflationIndex: 247.867,
        fixedIncomeInterest: 2.58
      }
    ];
    expect(parseCSVStringToJSON(dataString)).toEqual(expected);
  });
});
