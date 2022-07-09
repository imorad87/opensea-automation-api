import { CSVRecord } from "../common/types";

export interface IOpenseaHandler {
  makeOffer(asset: CSVRecord): any;
  getHighestOffer(assetContractAddress: string, tokenId: string): any;
}
