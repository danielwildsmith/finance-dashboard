import express, { Request, Response } from 'express';
import { Balance } from '../models/balance';
import { AccountsBalanceGetRequest } from 'plaid';
import { plaidClient } from '../config';

const router = express.Router();

router.put('/all', async function (req, res) {
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

export default router;