import express, { Request, Response } from 'express';
import { plaidClient } from '../config';
import { TransactionsGetRequest } from 'plaid';
import { format } from 'date-fns';
import { Transaction } from '../models/transaction';
import { Op } from 'sequelize';

const router = express.Router();

router.post('/', async function (req : Request, res : Response) {
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

router.get('/:username', async function (req : Request, res : Response) {
  const username : string = req.params.username;

  // find all balance records associated with this username
  const transactions = await Transaction.findAll({
    where: {
      username: username
    }
  });

  if(transactions.length === 0) {
    res.status(404).send( {error: "No transaction records associated with this username"} );
    return;
  }

  res.status(200).send(transactions);
});

router.get('/:username/:yyyy/:mm', async function (req : Request, res : Response) {
  const username : string = req.params.username;
  const year : string = req.params.yyyy;
  const month : string = req.params.mm;

  // find all transaction records associated with this username in this month on this year
  const transactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.gte]: `${year}-${month}-01`,
        [Op.lte]: `${year}-${month}-31`
      }
    }
  });

  if(transactions.length === 0) {
    res.status(404).send( {error: "No transaction records associated with this username in this time period"} );
    return;
  }

  res.status(200).send(transactions);
});

router.put('/note/:id', async function (req : Request, res : Response) {
  let transaction = await Transaction.findByPk(req.params.id);

  if(transaction === null) {
    res.status(404).send( {error: "Transaction not found"} );
    return;
  }

  try {
    await Transaction.update({note: req.body.note}, {
      where: {
        transaction_id: req.params.id
      }
    });  
  }
  catch(error) {
    console.error(error);
    return;
  }
  
  transaction = await Transaction.findByPk(req.params.id);

  res.status(200).send(transaction);
});

router.put('/verify/:id', async function (req : Request, res : Response) {
  let transaction = await Transaction.findByPk(req.params.id);

  if(transaction === null) {
    res.status(404).send( {error: "Transaction not found"} );
    return;
  }

  try {
    await Transaction.update({verified: req.body.verified}, {
      where: {
        transaction_id: req.params.id
      }
    });  
  }
  catch(error) {
    console.error(error);
    return;
  }
  
  transaction = await Transaction.findByPk(req.params.id);

  res.status(200).send(transaction);
});

export default router;