export interface ICSVReader {
  readFile(filePath: string): any;
  isValidFile(filePath: string): boolean;
}
