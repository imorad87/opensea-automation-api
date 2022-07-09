import { ICSVReader } from "src/contracts/csv-reader.interface";
import { createReadStream } from "fs";
import { parse as parser } from "csv-parse";
export class CSVReaderService implements ICSVReader {
  readFile(filePath: string) {
    const records = createReadStream(filePath, {
      encoding: "utf-8",
    }).pipe(
      parser({
        columns: true,
        delimiter: ",",
      })
    );

    return records;
  }
  isValidFile(filePath: string): boolean {
    throw new Error("Method not implemented.");
  }
}
