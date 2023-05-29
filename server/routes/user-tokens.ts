import express, { Request, Response } from 'express';
const router = express.Router();
import { LinkTokenCreateRequest } from 'plaid';
import { plaidClient } from '../utils/config';
import { UserToken } from '../models/user-token';

router.post('/create', async (request : Request, response : Response) => {
  // Get the client_user_id by searching for the current user
  // const user = await User.find(...);
  // const clientUserId = user.id;
  const plaidReq : LinkTokenCreateRequest = {
    user: {
      // This should correspond to a unique id for the current user. (1 for now just testing)
      client_user_id: '1',
    },
    client_name: 'Plaid Test App',
    // @ts-ignore
    products: ['transactions'],
    language: 'en',
    webhook: 'https://webhook.example.com',
    redirect_uri: 'http://localhost:3000',
    // @ts-ignore
    country_codes: ['US'],
  };
  try {
    const createTokenResponse = await plaidClient.linkTokenCreate(plaidReq);
    response.json(createTokenResponse.data);
  } catch (error) {
    // handle error
    console.log(error);
  }
});

router.post('/set', async (request : Request, response : Response, ) => {
  // exchanges the public token provided from Link component for a permanent access token
  const publicToken = request.body.public_token;
  try {
    const exchange_response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
  
    // These values should be saved to a persistent database and
    // associated with the currently signed-in user
    const accessToken = exchange_response.data.access_token;
    const itemID = exchange_response.data.item_id;
    console.log(itemID);

    await UserToken.create({ access_token: accessToken, username: "user_good" });
  
    response.json({ public_token_exchange: 'complete' });
  } catch (error) {
    // handle error
    console.log(error);
  }
});

export default router;