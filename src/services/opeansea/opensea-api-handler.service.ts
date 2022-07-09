import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Helpers } from "../../common/helpers";
import { CSVRecord, OfferData } from "../../common/types";
import { IOpenseaHandler } from "../../contracts/opensea-handler.interface";
import { OpenseaClient } from "./opensea-client";
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { WyvernSchemaName } = require("opensea-js/lib/types");
import { WyvernSchemaName } from "opensea-js/lib/types";
import { isEmpty } from "lodash";
@Injectable()
export class OpenseaAPIHandlerService implements IOpenseaHandler {
  private count = 0;
  private logger = new Logger(OpenseaAPIHandlerService.name);
  constructor(private readonly openseaClient: OpenseaClient, private config: ConfigService) {}
  async getHighestOffer(assetContractAddress: string, tokenId: string) {
    try {
      this.logger.log(`Getting hieghest offer for tokenAddress [${assetContractAddress}] tokenId [${tokenId}]`);

      const client = await this.openseaClient.getClient();

      const response = await client.api.getOrders({
        assetContractAddress: assetContractAddress,
        tokenIds: [tokenId],
        protocol: "seaport",
        side: "bid",
        orderDirection: "desc",
        orderBy: "eth_price",
      });

      if (!isEmpty(response.orders)) {
        await Helpers.sleep(parseInt(this.config.get("RETRIEVING_DELAY")));

        const { currentPrice, maker } = response.orders[0];

        const offer: OfferData = {
          currentPrice: parseInt(currentPrice) / 1e18,

          offerer: maker.address,
        };

        return offer;
      } else {
        return null;
      }
    } catch (error) {
      this.count++;

      if (this.count == this.config.get("ERROR_RETRIES")) {
        this.logger.log(`Tried ${this.config.get("ERROR_RETRIES")} times to get tokenAddress [${assetContractAddress}] tokenId [${tokenId}]. Skipping.`);

        this.count = 0;

        return null;
      }

      this.logger.error(error);

      this.logger.log("Retrying in 10 seconds due to the encountered error...");

      await Helpers.sleep(10);

      return await this.getHighestOffer(assetContractAddress, tokenId);
    }
  }
  async makeOffer(asset: CSVRecord): Promise<boolean> {
    const accountAddress = this.config.get("ACCOUNT_ADDRESS");

    const { token_id, token_address, offer_max, offer_min, dynamic_offer, outbid_amt, expiration } = asset;

    const client = await this.openseaClient.getClient();

    const highestOffer: OfferData = await this.getHighestOffer(token_address, token_id);

    if (highestOffer) {
      const { currentPrice, offerer } = highestOffer;

      this.logger.log(`Highest offer: ${JSON.stringify(highestOffer)}`);

      if (accountAddress.toLowerCase() == offerer) {
        this.logger.log(`You offer is already the highest offer for tokenAddress [${token_address}] tokenID [${token_id}]`);

        return false;
      }

      if (currentPrice === parseFloat(offer_max)) {
        this.logger.log(`current_offer > offer_max for [${token_address}] tokenID [${token_id}]. Skipping...`);

        return false;
      }

      const startAmount = this.calculateOfferAmount(currentPrice, offer_max, offer_min, outbid_amt, dynamic_offer);

      this.logger.log(`Calculated offer amount: ${startAmount}`);

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const offer = await client.createBuyOrder({
          asset: {
            tokenId: token_id,
            tokenAddress: token_address,
            schemaName: WyvernSchemaName.ERC721,
          },
          accountAddress,
          startAmount: startAmount,
          expirationTime: Math.round(Date.now() / 1000 + 60 * parseInt(expiration)), // validity determines the no of hours of expiry
        });
      } catch (error) {
        // console.log(error);

        this.logger.error(`${error.message} for tokenAddress [${token_address}] tokenId [${token_id}]`);

        return false;
      }

      this.logger.log(`Offer created successfully for tokenAddress [${token_address}] tokenId [${token_id}]`);
      this.logger.log(`Sleeping ${this.config.get("OFFER_DELAY")} seconds after making the offer`);
      await Helpers.sleep(this.config.get("OFFER_DELAY"));
      return true;
    } else {
      this.logger.log(`No offer for, using offer_min: ${asset.offer_min}`);

      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const offer = await client.createBuyOrder({
          asset: {
            tokenId: token_id,
            tokenAddress: token_address,
            schemaName: WyvernSchemaName.ERC721,
          },
          accountAddress,
          startAmount: asset.offer_min,
          expirationTime: Math.round(Date.now() / 1000 + 60 * parseInt(expiration)), // validity determines the no of hours of expiry
        });
      } catch (error) {
        this.logger.error(`${error.message} for tokenAddress [${token_address}] tokenId [${token_id}]`);

        return false;
      }

      this.logger.log(`Offer created successfully for tokenAddress [${token_address}] tokenId [${token_id}]`);
      this.logger.log(`Sleeping ${this.config.get("OFFER_DELAY")} seconds after making the offer`);
      await Helpers.sleep(this.config.get("OFFER_DELAY"));
      return true;
    }
  }

  private calculateOfferAmount(currentPrice: number, offerMax: string, offerMin: string, outbidAmount: string, dynamicOffer: string) {
    this.logger.log("Calculating offer amount");

    if (parseInt(dynamicOffer) === 1) {
      if (currentPrice >= parseFloat(offerMin) && currentPrice < parseFloat(offerMax)) {
        return currentPrice + parseFloat(outbidAmount);
      } else if (currentPrice < parseFloat(offerMin)) {
        return offerMin;
      }
    }
    return offerMin;
  }
}
