import { IParsableInput } from "src/contracts/parsable-input.interface";
import { existsSync } from "fs";
import { UserInput } from "../common/types";
import { prompt } from "enquirer";

export class UserInputService implements IParsableInput {
  async readUserInput() {
    // const previousInput: any = {};
    // const previousInput = cache.getKey("userInput");
    const answers: any = await prompt([
      {
        type: "input",
        name: "csvPath",
        message: "Enter the csv path",
        required: true,
        initial: "",
        validate(value) {
          if (!value) {
            return "CSV Path is required";
          }

          if (!existsSync(value) || !value.endsWith(".csv")) return "Your CSV input path is not a valid file";

          return true;
        },
      },
    ]);

    const userInput: UserInput = {
      csvPath: answers.csvPath,
      testRun: answers.testRun,
    };

    return userInput;
  }
}
