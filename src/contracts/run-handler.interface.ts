export interface IRunHandler {
  getUserInput(): any;
  establishConnection(creds: any): any;

  getCSVRecords(filePath: string): any;

  handleRecord(record: any): boolean;
}
