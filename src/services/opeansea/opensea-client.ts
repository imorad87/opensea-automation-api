/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpenSeaPort, Network } from "opensea-js";
const HDWalletProvider = require("@truffle/hdwallet-provider");

@Injectable()
export class OpenseaClient {
  private readonly logger = new Logger(OpenseaClient.name);
  constructor(private readonly config: ConfigService) {}

  async getClient() {
    const provider = new HDWalletProvider({
      mnemonic: this.config.get("PHRASE"),
      providerOrUrl: this.config.get("INFURA_URL"),
    });

    const seaport = new OpenSeaPort(provider, {
      networkName: this.config.get("TEST_NETWORK") === "true" ? Network.Rinkeby : Network.Main,
      apiKey: this.config.get("TEST_NETWORK") === "true" ? "" : this.config.get("OPENSEA_API_KEY"),
    });

    return seaport;
  }
}
