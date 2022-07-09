import { Logger } from "@nestjs/common";

export class Helpers {
  private static logger = new Logger(Helpers.name);
  static async sleep(seconds: number) {
    // Helpers.logger.log(`Sleeping ${seconds} seconds`);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
