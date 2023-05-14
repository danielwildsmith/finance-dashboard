import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

// Valid NODE_ENV states: 'sandbox' or 'development'
const NODE_ENV = 'sandbox'
// PlanetScale (hosted MySQL db) URI

const configPlaid = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SANDBOX_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configPlaid);
