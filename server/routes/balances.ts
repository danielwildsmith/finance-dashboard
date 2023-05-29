import express, { Request, Response } from 'express';
import { plaidClient } from '../config';
import { AccountsBalanceGetRequest } from 'plaid';
import { Balance } from '../models/balance';

const router = express.Router();

router.post('/', async function (req : Request, res : Response) {
  const balancesReq: AccountsBalanceGetRequest = {
    access_token: req.body.access_token,
  };

  try {
      const response = await plaidClient.accountsBalanceGet(balancesReq);
      res.send(response.data.accounts);
  } catch (error) {
    console.error(error);
  }
});

router.get('/:username', async function (req : Request, res : Response) {
  const username : string = req.params.username;

  // find all balance records associated with this username
  const balances = await Balance.findAll({
    where: {
      username: username
    }
  });

  if(balances.length === 0) {
    res.status(404).send( {error: "No balance records associated with this username"} );
    return;
  }

  res.status(200).send(balances);
});

export default router;