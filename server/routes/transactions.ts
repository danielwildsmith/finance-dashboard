import express, { Request, Response } from 'express';
import { plaidClient } from '../utils/config';
import { TransactionsGetRequest } from 'plaid';
import { format } from 'date-fns';
import { Transaction } from '../models/transaction';
import { Op, Model } from 'sequelize';
import { MonthlyCategoryData } from '../../src/components/transactions/transactions';

const router = express.Router();

router.post('/', async function (req : Request, res : Response) {
  const currentDate = new Date();
  const formattedDate : string = format(currentDate, 'yyyy-MM-dd');
  
  const transactionsReq: TransactionsGetRequest = {
    access_token: req.body.access_token,
    start_date: '2000-01-01',
    end_date: formattedDate,
    options: { include_personal_finance_category: true }
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

// For category: amount chart
router.get('/categorized/:username/:yyyy/:mm', async function (req : Request, res : Response) {
  const username : string = req.params.username;
  const year : string = req.params.yyyy;
  const month : string = req.params.mm;
  let days_in_month = new Date(parseInt(year), parseInt(month), 0).getDate();

  // find all transaction records associated with this username in this month on this year
  const transactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.gte]: `${year}-${month}-01`,
        [Op.lte]: `${year}-${month}-${days_in_month}`
      }
    }
  });

  if(transactions.length === 0) {
    res.status(404).send( {error: "No transaction records associated with this username in this time period"} );
    return;
  }

  let category_amounts_map: { [category: string]: number } = {};
  transactions.forEach(transaction => {
    if (transaction.dataValues.category && transaction.dataValues.amount > 0) {
      let category : string = JSON.parse(transaction.dataValues.category)[0];
      if(category_amounts_map[category]) {
        category_amounts_map[category] = category_amounts_map[category] + transaction.dataValues.amount;
      }
      else {
        category_amounts_map[category] = transaction.dataValues.amount;
      }
    }
  });

  let formatted_category_amounts : { name: string; value: number; }[] = [];
  for(const [key, value] of Object.entries(category_amounts_map)) {
    formatted_category_amounts.push({ name: key, value: value })
  };  

  res.status(200).send(formatted_category_amounts);
});

// for month to month comparisons with category breakdown
router.get('/monthly/:username/:yyyy/:mm', async function (req : Request, res : Response) {
  const username : string = req.params.username;
  let year : string = req.params.yyyy;
  const month : string = req.params.mm;
  let days_in_month = new Date(parseInt(year), parseInt(month), 0).getDate();

  // find all transaction records associated with this username in this month on this year
  const selected_month_transactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.gte]: `${year}-${month}-01`,
        [Op.lte]: `${year}-${month}-${days_in_month}`
      }
    }
  });

  // find all transaction records associated with this username in the previous and penultimate months
  let previous_month = parseInt(month) - 1;
  let penultimate_month = parseInt(month) - 2;
  // edge case: January (00, -01 => 12, 11)
  if(previous_month === 0 && penultimate_month === -1) {
    previous_month = 12;
    penultimate_month = 11;
    year = (parseInt(year) - 1).toString();
  }
  const formatted_previous_month = previous_month.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
  days_in_month = new Date(parseInt(year), previous_month, 0).getDate();

  const previous_month_transactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.gte]: `${year}-${formatted_previous_month}-01`,
        [Op.lte]: `${year}-${formatted_previous_month}-${days_in_month}`
      }
    }
  });

  //edge case: February (01, 00 => 01, 12)
  if(previous_month === 1 && penultimate_month === 0) {
    penultimate_month = 12;
    year = (parseInt(year) - 1).toString();
  }
  const formatted_penultimate_month = penultimate_month.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
  days_in_month = new Date(parseInt(year), penultimate_month, 0).getDate();

  const penultimate_month_transactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.gte]: `${year}-${formatted_penultimate_month}-01`,
        [Op.lte]: `${year}-${formatted_penultimate_month}-${days_in_month}`
      }
    }
  });

  if(selected_month_transactions.length === 0 && previous_month_transactions.length === 0 && penultimate_month_transactions.length === 0) {
    res.status(404).send( {error: "No transaction records associated with this username in this time period"} );
    return;
  }

  const getByCategoryData = (month_transactions : Model<any, any>[]): { [category: string]: number } => {
    let category_amounts_map: { [category: string]: number } = {};
    month_transactions.forEach(transaction => {
      if (transaction.dataValues.category && transaction.dataValues.amount > 0) {
        let category : string = JSON.parse(transaction.dataValues.category);
        if(category_amounts_map[category]) {
          category_amounts_map[category] = category_amounts_map[category] + transaction.dataValues.amount;
        }
        else {
          category_amounts_map[category] = transaction.dataValues.amount;
        }
      }
    });
    return category_amounts_map;
  };

  // move data into objects for front-end
  let monthly_category_data : MonthlyCategoryData[] = [];
  for(const [key, value] of Object.entries(getByCategoryData(selected_month_transactions))) {
    monthly_category_data.push({
      category: key, selected_month: month, selected_month_amount: value, previous_month: formatted_previous_month, previous_month_amount: 0, 
      penultimate_month: formatted_penultimate_month, penultimate_month_amount: 0
    });
  };
  for(const [key, value] of Object.entries(getByCategoryData(previous_month_transactions))) {
    let index = monthly_category_data.findIndex((obj => obj.category === key));
    // category does not exist already
    if(index === -1) {
      monthly_category_data.push({
        category: key, selected_month: month, selected_month_amount: 0, previous_month: formatted_previous_month, previous_month_amount: value, 
        penultimate_month: formatted_penultimate_month, penultimate_month_amount: 0
      });
    } 
    else {
      monthly_category_data[index].previous_month_amount = value;
    }
  };
  for(const [key, value] of Object.entries(getByCategoryData(penultimate_month_transactions))) {
    let index = monthly_category_data.findIndex((obj => obj.category === key));
    // category does not exist already
    if(index === -1) {
      monthly_category_data.push({
        category: key, selected_month: month, selected_month_amount: 0, previous_month: formatted_previous_month, previous_month_amount: 0, 
        penultimate_month: formatted_penultimate_month, penultimate_month_amount: value
      });
    } 
    else {
      monthly_category_data[index].penultimate_month_amount = value;
    }
  };

  res.status(200).send(monthly_category_data);
});


router.get('/:username/:yyyy/:mm', async function (req : Request, res : Response) {
  const username : string = req.params.username;
  const year : string = req.params.yyyy;
  const month : string = req.params.mm;
  let days_in_month = new Date(parseInt(year), parseInt(month), 0).getDate();

  // find all transaction records associated with this username in this month on this year
  const transactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.gte]: `${year}-${month}-01`,
        [Op.lte]: `${year}-${month}-${days_in_month}`
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