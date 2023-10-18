export const QUERY_KEYS = {
  RECIPIENT: {
    ALL: 'get-all-recipients',
    MINE: 'get-my-recipes'
  },
  ORGANIZATION: {
    FROM_IDS: 'get-organizations-from-ids'
  },
  VESTING: {
    FROM_IDS: 'get-vestings-from-ids'
  },
  TOKEN: {
    FROM_IDS: 'get-tokens-from-ids'
  },
  VESTING_CONTRACT: {
    FROM_IDS: 'get-vesting-contracts-from-ids',
    FROM_ORGANIZATION: 'get-vesting-contracts-from-organization'
  },
  VESTING_INFO: {
    FROM_CONTRACTS: 'get-vesting-info-from-contract'
  },
  API_KEYS: {
    GET_KEYS: 'get-api-key'
  },
  USD_PRICE: 'get_usd_price'
};
