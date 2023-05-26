import express, { Request, Response } from 'express';
import { Transaction } from '../models/transaction';
import { TransactionsGetRequest } from 'plaid';
import { plaidClient } from '../config';
import { format } from 'date-fns';

const router = express.Router();

router.put('/all', async function (req, res) {
    const currentDate = new Date();
    const formattedDate : string = format(currentDate, 'yyyy-MM-dd');
    
    const transactionsReq: TransactionsGetRequest = {
      access_token: req.body.access_token,
      start_date: '2000-01-01',
      end_date: formattedDate
    };
  
    try {
      const transactions = await plaidClient.transactionsGet(transactionsReq);
      res.send(transactions.data.transactions);
    } catch (error) {
      console.log(error);
    }
});

export default router;