import { Injectable } from "@nestjs/common";
import { CSVRecord } from "src/common/types";
import { IRunHandler } from "../contracts/run-handler.interface";
import { CSVReaderService } from "./csv-reader.service";
import { UserInputService } from "./user-input.service";

@Injectable()
export class RunControllerService implements IRunHandler {
  constructor(private readonly userInputService: UserInputService, private readonly csvReaderService: CSVReaderService) {}
  async getUserInput() {
    return await this.userInputService.readUserInput();
  }
  establishConnection(creds: any) {
    throw new Error("Method not implemented.");
  }
  async getCSVRecords(filePath: string) {
    const records: CSVRecord[] = [];

    const parser = this.csvReaderService.readFile(filePath);

    for await (const record of parser) {
      records.push(record);
    }

    return records;
  }
  handleRecord(record: any): boolean {
    throw new Error("Method not implemented.");
  }
}
