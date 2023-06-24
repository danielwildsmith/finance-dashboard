import express, {Request, Response} from "express";
const router = express.Router();
import {CountryCode, LinkTokenCreateRequest, Products} from "plaid";
import {plaidClient} from "../utils/config";
import {UserToken} from "../models/user-token";
import { authenticateUser } from "../utils/auth";

router.post("/create/:username", authenticateUser, async (request : Request, response: Response) => {
  const username = request.params.username;
  const plaidReq: LinkTokenCreateRequest = {
    user: {
      // This should correspond to a unique id for the current user. (1 for now just testing)
      client_user_id: username as string,
    },
    client_name: "Finance Dashboard",
    products: [Products.Transactions],
    language: "en",
    webhook: "https://danielwildsmith.github.io/finance-dashboard/#/dashboard",
    redirect_uri: "https://danielwildsmith.github.io/finance-dashboard/",
    country_codes: [CountryCode.Us],
  };
  try {
    const createTokenResponse = await plaidClient.linkTokenCreate(plaidReq);
    response.json(createTokenResponse.data);
  } catch (error) {
    // handle error
    console.log(error);
  }
});

router.post("/set/:username", authenticateUser, async (request: Request, response: Response) => {
  // exchanges the public token provided from Link component for a permanent access token
  const publicToken = request.body.public_token;
  const username: string = request.params.username;

  try {
    const exchange_response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    // These values should be saved to a persistent database and
    // associated with the currently signed-in user
    const accessToken = exchange_response.data.access_token;

    await UserToken.create({access_token: accessToken, username: username});

    response.status(200).json(accessToken);
  } catch (error) {
    // handle error
    console.log(error);
  }
});

router.get("/:username", authenticateUser, async (req: Request, res: Response) => {
  const username: string = req.params.username;

  const accessTokens = await UserToken.findAll({
    where: {username: username},
  });

  res.status(200).json(accessTokens.length);
});

export default router;
