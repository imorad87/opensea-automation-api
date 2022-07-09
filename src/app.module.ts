import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CSVReaderService } from "./services/csv-reader.service";
import { OpenseaAPIHandlerService } from "./services/opeansea/opensea-api-handler.service";
import { OpenseaClient } from "./services/opeansea/opensea-client";
import { RunControllerService } from "./services/run-controller.service";
import { UserInputService } from "./services/user-input.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [CSVReaderService, OpenseaAPIHandlerService, RunControllerService, UserInputService, OpenseaClient],
})
export class AppModule {}
