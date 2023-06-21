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
    webhook: 'https://danielwildsmith.github.io/finance-dashboard/#/dashboard',
    redirect_uri: 'https://danielwildsmith.github.io/finance-dashboard/',
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

router.post('/set/:username', async (request : Request, response : Response, ) => {
  // exchanges the public token provided from Link component for a permanent access token
  const publicToken = request.body.public_token;
  const username : string = request.params.username;

  try {
    const exchange_response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
  
    // These values should be saved to a persistent database and
    // associated with the currently signed-in user
    const accessToken = exchange_response.data.access_token;
    const itemID = exchange_response.data.item_id;

    await UserToken.create({ access_token: accessToken, username: username });
  
    response.status(200).json(accessToken);
  } catch (error) {
    // handle error
    console.log(error);
  }
});

router.get('/:username', async (req : Request, res : Response, ) => {
  const username : string = req.params.username;

  const accessTokens = await UserToken.findAll({
    where: {username: username}
  });

  res.status(200).json(accessTokens.length);
});

export default router;