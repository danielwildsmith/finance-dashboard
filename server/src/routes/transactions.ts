import express, {Request, Response} from "express";
import {plaidClient} from "../utils/config";
import {TransactionsGetRequest} from "plaid";
import {format} from "date-fns";
import {Transaction} from "../models/transaction";
import {Op, Model} from "sequelize";

interface CategoryData {
  category: string;
  month: string;
  previous_month: string;
  amount: number;
  previous_month_amount: number;
}

interface MonthlyTotalData {
  month: string;
  "Food And Drink": number;
  "General Merchandise": number;
  Transportation: number;
  "Rent And Utilities": number;
  Travel: number;
  "Transfer Out": number;
  "General Services": number;
  Other: number;
  total: number;
  [key: string]: number | string;
}

interface TransactionRow {
  id: string;
  date: string;
  name: string;
  category: string;
  amount: number;
  note: string;
  verified: boolean;
}

const CATEGORIES = [
  "Food And Drink",
  "General Merchandise",
  "Transportation",
  "Rent And Utilities",
  "Travel",
  "Transfer Out",
  "General Services",
  "Other",
];

interface MonthlyAmountComparison {
  recentAmount: number;
  previousAmount: number;
  available: boolean;
}

const router = express.Router();

// for seeding the db
router.post("/:username", async function(req : Request, res : Response) {
  const currentDate = new Date();
  const formattedDate : string = format(currentDate, "yyyy-MM-dd");
  const username = req.params.username;

  const transactionsReq: TransactionsGetRequest = {
    access_token: req.body.access_token,
    start_date: "2000-01-01",
    end_date: formattedDate,
    options: {include_personal_finance_category: true},
  };

  try {
    const transactions = await plaidClient.transactionsGet(transactionsReq);
    transactions.data.transactions.forEach((transaction) => {
      (async () => {
        await Transaction.findOrCreate(
          {
            where: {transaction_id: transaction.transaction_id},
            defaults:
                      {
                        date: transaction.date,
                        name: transaction.merchant_name,
                        // @ts-ignore
                        category: JSON.stringify(transaction.personal_finance_category.primary),
                        amount: transaction.amount,
                        username: username,
                      },
          }
        );
      })();
    });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
  }
});

// for month to month comparisons with category breakdown
router.get("/categorized/:username/:yyyy/:mm", async function(req : Request, res : Response) {
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
        [Op.lte]: `${year}-${month}-${days_in_month}`,
      },
    },
  });

  // find all transaction records associated with this username in the previous month
  let previous_month = parseInt(month) - 1;
  // edge case: January (00, -01 => 12, 11)
  if (previous_month === 0) {
    previous_month = 12;
    year = (parseInt(year) - 1).toString();
  }
  const formatted_previous_month = previous_month.toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping: false});
  days_in_month = new Date(parseInt(year), previous_month, 0).getDate();

  const previous_month_transactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.gte]: `${year}-${formatted_previous_month}-01`,
        [Op.lte]: `${year}-${formatted_previous_month}-${days_in_month}`,
      },
    },
  });


  if (selected_month_transactions.length === 0 && previous_month_transactions.length === 0) {
    res.status(200).send([]);
    return;
  }

  const getByCategoryData = (month_transactions : Model<any, any>[]): { [category: string]: number } => {
    const category_amounts_map: { [category: string]: number } = {};
    CATEGORIES.forEach((category) => category_amounts_map[category] = 0);
    month_transactions.forEach((transaction) => {
      if (transaction.dataValues.category && transaction.dataValues.amount > 0) {
        let category : string = JSON.parse(transaction.dataValues.category);
        category = category.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        if (!CATEGORIES.includes(category)) {
          category = "Other";
        }
        category_amounts_map[category] = Number((category_amounts_map[category] + transaction.dataValues.amount).toFixed(2));
      }
    });
    return category_amounts_map;
  };

  // move data into objects for front-end
  const category_data : CategoryData[] = [];
  for (const [key, value] of Object.entries(getByCategoryData(selected_month_transactions))) {
    category_data.push({
      category: key, month: month, amount: value, previous_month: formatted_previous_month, previous_month_amount: 0,
    });
  }
  for (const [key, value] of Object.entries(getByCategoryData(previous_month_transactions))) {
    const index = category_data.findIndex(((obj) => obj.category === key));
    // category does not exist already
    if (index === -1) {
      category_data.push({
        category: key, month: month, amount: 0, previous_month: formatted_previous_month, previous_month_amount: value,
      });
    } else {
      category_data[index].previous_month_amount = value;
    }
  }

  res.status(200).send(category_data);
});

// for monthly totals chart
router.get("/totals/:username/:yyyy/:mm", async function(req : Request, res : Response) {
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
        [Op.lte]: `${year}-${month}-${days_in_month}`,
      },
    },
  });

  // find all transaction records associated with this username in the previous and penultimate months
  let previous_month = parseInt(month) - 1;
  let penultimate_month = parseInt(month) - 2;
  // edge case: January (00, -01 => 12, 11)
  if (previous_month === 0 && penultimate_month === -1) {
    previous_month = 12;
    penultimate_month = 11;
    year = (parseInt(year) - 1).toString();
  }
  const formatted_previous_month = previous_month.toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping: false});
  days_in_month = new Date(parseInt(year), previous_month, 0).getDate();

  const previous_month_transactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.gte]: `${year}-${formatted_previous_month}-01`,
        [Op.lte]: `${year}-${formatted_previous_month}-${days_in_month}`,
      },
    },
  });

  // edge case: February (01, 00 => 01, 12)
  if (previous_month === 1 && penultimate_month === 0) {
    penultimate_month = 12;
    year = (parseInt(year) - 1).toString();
  }
  const formatted_penultimate_month = penultimate_month.toLocaleString("en-US", {minimumIntegerDigits: 2, useGrouping: false});
  days_in_month = new Date(parseInt(year), penultimate_month, 0).getDate();

  const penultimate_month_transactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.gte]: `${year}-${formatted_penultimate_month}-01`,
        [Op.lte]: `${year}-${formatted_penultimate_month}-${days_in_month}`,
      },
    },
  });

  if (selected_month_transactions.length === 0 && previous_month_transactions.length === 0 && penultimate_month_transactions.length === 0) {
    res.status(200).send([{
      month: month, FOOD_AND_DRINK: 0, GENERAL_MERCHANDISE: 0, TRANSPORTATION: 0, RENT_AND_UTILITIES: 0,
      TRAVEL: 0, TRANSFER_OUT: 0, GENERAL_SERVICES: 0, OTHER: 0,
    }]);
    return;
  }

  const getByCategoryData = (month_transactions : Model<any, any>[]): { [category: string]: number } => {
    const category_amounts_map: { [category: string]: number } = {};
    month_transactions.forEach((transaction) => {
      if (transaction.dataValues.category && transaction.dataValues.amount > 0) {
        let category : string = JSON.parse(transaction.dataValues.category);
        category = category.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        if (!CATEGORIES.includes(category)) {
          category = "Other";
        }
        if (category_amounts_map[category]) {
          category_amounts_map[category] = Number((category_amounts_map[category] + transaction.dataValues.amount).toFixed(2));
        } else {
          category_amounts_map[category] = Number(transaction.dataValues.amount.toFixed(2));
        }
      }
    });
    return category_amounts_map;
  };

  const getTemplateData = (month : string) : MonthlyTotalData => {
    return {
      "month": month,
      "Food And Drink": 0,
      "General Merchandise": 0,
      "Transportation": 0,
      "Rent And Utilities": 0,
      "Travel": 0,
      "Transfer Out": 0,
      "General Services": 0,
      "Other": 0,
      "total": 0,
    };
  };

  // calculate total (for label)
  const getTotal = (categoryAmounts : { [category: string]: number } ) => {
    let total = 0;
    for (const category in categoryAmounts) {
      total += categoryAmounts[category];
    }
    return total;
  };

  // for y axis translating number to month format
  const prev_month = previous_month.toString().length === 1 ? previous_month.toString().padStart(2, "0") : previous_month.toString();
  const penult_month = penultimate_month.toString().length === 1 ? penultimate_month.toString().padStart(2, "0") : penultimate_month.toString();
  const finalData = [
    {...getTemplateData(month), ...getByCategoryData(selected_month_transactions), total: getTotal(getByCategoryData(selected_month_transactions))},
    {...getTemplateData(prev_month), ...getByCategoryData(previous_month_transactions), total: getTotal(getByCategoryData(previous_month_transactions))},
    {...getTemplateData(penult_month), ...getByCategoryData(penultimate_month_transactions), total: getTotal(getByCategoryData(penultimate_month_transactions))},
  ];

  res.status(200).send(finalData);
});

// for the transactions table
router.get("/:username/:yyyy/:mm", async function(req : Request, res : Response) {
  const username : string = req.params.username;
  const year : string = req.params.yyyy;
  const month : string = req.params.mm;
  const days_in_month = new Date(parseInt(year), parseInt(month), 0).getDate();

  // find all transaction records associated with this username in this month on this year
  const transactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.gte]: `${year}-${month}-01`,
        [Op.lte]: `${year}-${month}-${days_in_month}`,
      },
    },
  });

  const transaction_rows : TransactionRow[] = [];
  transactions.forEach((transaction) => {
    if (transaction.dataValues.category && transaction.dataValues.amount > 0) {
      let category : string = JSON.parse(transaction.dataValues.category);
      category = category.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      if (!CATEGORIES.includes(category)) {
        category = "OTHER";
      }
      transaction_rows.push(
        {
          id: transaction.dataValues.transaction_id,
          date: transaction.dataValues.date,
          name: transaction.dataValues.name,
          category: category.replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()),
          amount: transaction.dataValues.amount.toFixed(2),
          note: transaction.dataValues.note,
          verified: transaction.dataValues.verified,
        }
      );
    }
  });

  res.status(200).send(transaction_rows);
});

// for updating the transactions table 'note' field
router.put("/note/:id", async function(req : Request, res : Response) {
  let transaction = await Transaction.findByPk(req.params.id);

  if (transaction === null) {
    res.status(404).send( {error: "Transaction not found"} );
    return;
  }

  try {
    await Transaction.update({note: req.body.note}, {
      where: {
        transaction_id: req.params.id,
      },
    });
  } catch (error) {
    console.error(error);
    return;
  }

  transaction = await Transaction.findByPk(req.params.id);

  const transaction_row : TransactionRow = {
    id: transaction?.dataValues.transaction_id,
    date: transaction?.dataValues.date,
    name: transaction?.dataValues.name,
    category: req.body.category,
    amount: Number(transaction?.dataValues.amount.toLocaleString("en-US", {minimumFractionDigits: 2})),
    note: transaction?.dataValues.note,
    verified: transaction?.dataValues.verified,
  };
  res.status(200).send(transaction_row);
});

// for updating the transactions table 'verified' field
router.put("/verify/:id", async function(req : Request, res : Response) {
  let transaction = await Transaction.findByPk(req.params.id);

  if (transaction === null) {
    res.status(404).send( {error: "Transaction not found"} );
    return;
  }

  try {
    await Transaction.update({verified: req.body.verified}, {
      where: {
        transaction_id: req.params.id,
      },
    });
  } catch (error) {
    console.error(error);
    return;
  }

  transaction = await Transaction.findByPk(req.params.id);

  const transaction_row : TransactionRow = {
    id: transaction?.dataValues.transaction_id,
    date: transaction?.dataValues.date,
    name: transaction?.dataValues.name,
    category: req.body.category,
    amount: Number(transaction?.dataValues.amount.toLocaleString("en-US", {minimumFractionDigits: 2})),
    note: transaction?.dataValues.note,
    verified: transaction?.dataValues.verified,
  };
  res.status(200).send(transaction_row);
});

router.get("/comparison/:username", async function(req : Request, res : Response) {
  const username : string = req.params.username;
  const date = new Date();
  let formattedEndDate = format(date, "yyyy-MM-dd");
  date.setDate(date.getDate() - 30);
  let formattedStartDate = format(date, "yyyy-MM-dd");

  let recentAmount = 0;
  let previousAmount = 0;

  // get total of balances on current date
  const recentTransactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.lte]: formattedEndDate,
        [Op.gte]: formattedStartDate,
      },
      amount: {[Op.gt]: 0},
    },
  });

  recentTransactions.forEach((transaction) =>
    recentAmount += transaction.dataValues.amount
  );

  formattedEndDate = formattedStartDate;
  date.setDate(date.getDate() - 30);
  formattedStartDate = format(date, "yyyy-MM-dd");

  const previousTransactions = await Transaction.findAll({
    where: {
      username: username,
      date: {
        [Op.lte]: formattedEndDate,
        [Op.gte]: formattedStartDate,
      },
      amount: {[Op.gt]: 0},
    },
  });

  previousTransactions.forEach((transaction) =>
    previousAmount += transaction.dataValues.amount
  );

  // comparison can only really be made after 30 days has passed
  const available = previousAmount === 0 || recentAmount === 0 ? false : true;
  const comparisonData : MonthlyAmountComparison = {recentAmount: recentAmount, previousAmount: previousAmount, available: available};
  res.status(200).send(comparisonData);
});

export default router;
