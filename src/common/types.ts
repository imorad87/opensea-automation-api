export type CSVRecord = {
  link: string;

  offer_min: string;

  offer_max: string;

  outbid_amt: string;

  expiration: string;

  token_address: string;

  token_id: string;

  dynamic_offer: string;
};

export type UserInput = {
  csvPath: string;

  testRun: boolean;
};

export type OfferData = {
  currentPrice: number;
  offerer: string;
};
