import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { OpenseaAPIHandlerService } from "./services/opeansea/opensea-api-handler.service";
import { RunControllerService } from "./services/run-controller.service";

async function bootstrap() {
  const logger = new Logger("Main");

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ["error", "log", "warn"] });

  const appController = app.get(RunControllerService);

  const answer = await appController.getUserInput();

  const records = await appController.getCSVRecords(answer.csvPath);

  const api = app.get(OpenseaAPIHandlerService);

  const config = app.get(ConfigService);

  if (config.get("REPEAT") == 1) {
    while (true) {
      for (const record of records) {
        logger.log(`Processing tokenAddress [${record.token_address}] tokenId [${record.token_id}]`);
        await api.makeOffer(record);
      }
    }
  } else {
    for (const record of records) {
      logger.log(`Processing tokenAddress [${record.token_address}] tokenId [${record.token_id}]`);
      await api.makeOffer(record);
    }
  }
}
bootstrap();
