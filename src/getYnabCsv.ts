import { parse } from "csv-parse/browser/esm";
import { stringify } from "csv-stringify/browser/esm";

type CSVRow = Array<String>;
type CSVBody = Array<CSVRow>;

function cleanupCsvString(csvString: string): string {
  const rows = csvString.split("\n");
  return rows.reduce((acc, current) => {
    if (acc.length > 0 || current.startsWith('"Datum splatnosti"')) {
      acc += current + "\n";
    }
    return acc;
  }, "");
}

function parseCsvString(csvString: string): Promise<CSVBody> {
  return new Promise((resolve, reject) => {
    parse(csvString, csvOptions, (err, records) => {
      if (err) {
        reject(err);
        return;
      }
      const dataArray = records.slice(1).map((rowRaw: Array<string>) => {
        const row = rowRaw.map((field) => field.trim());
        const date = row[18].length ? row[18].replace(/\s+.*$/, "") : row[0];
        const payee = (row[15].length && row[15]) || row[3];
        const memo = row[13];
        const amount = row[4];

        return [date, payee, memo, amount];
      });

      resolve(dataArray);
    });
  });
}

function getCsvString(csvData: CSVBody): Promise<string> {
  return new Promise((resolve, reject) => {
    stringify(
      csvData,
      {
        delimiter: ";",
        quoted: true,
      },
      (err, output) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(output);
      }
    );
  });
}

async function getYnabCsv(rawCsvData: string): Promise<string> {
  const csvString = cleanupCsvString(rawCsvData);
  const dataArray = await parseCsvString(csvString);
  const csvArray = [headerRow, ...dataArray];
  return await getCsvString(csvArray);
}

const headerRow = ["Date", "Payee", "Memo", "Amount"];
const csvOptions = { delimiter: ";" };

export default getYnabCsv;
