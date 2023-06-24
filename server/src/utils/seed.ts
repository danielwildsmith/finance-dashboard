import {UserToken} from "../models/user-token";
import {Transaction} from "../models/transaction";
import {Balance} from "../models/balance";
import axios from "axios";
import {User} from "../models/user";
import bcrypt from "bcrypt";
import {format} from "date-fns";
import * as functions from 'firebase-functions';

// sample transaction data
const possible_transactions = [
  {
    name: "Target",
    category: "\"General Merchandise\"",
    get amount() {
      return (Math.random() * (50 - 10) + 10).toFixed(2);
    },
  },
  {
    name: "Uber",
    category: "\"Transportation\"",
    get amount() {
      return (Math.random() * (15 - 8) + 8).toFixed(2);
    },
  },
  {
    name: "Uber",
    category: "\"Transportation\"",
    get amount() {
      return (Math.random() * (15 - 8) + 8).toFixed(2);
    },
  },
  {
    name: "Spirit Airlines",
    category: "\"Travel\"",
    get amount() {
      return (Math.random() * (350 - 100) + 100).toFixed(2);
    },
  },
  {
    name: "Rent",
    category: "\"Rent And Utilities\"",
    get amount() {
      return (Math.random() * (650 - 100) + 100).toFixed(2);
    },
  },
  {
    name: "Chick-Fil-A",
    category: "\"Food And Drink\"",
    get amount() {
      return (Math.random() * (20 - 12) + 12).toFixed(2);
    },
  },
  {
    name: "Aldi",
    category: "\"Food And Drink\"",
    get amount() {
      return (Math.random() * (50 - 30) + 30).toFixed(2);
    },
  },
  {
    name: "Chipotle",
    category: "\"Food And Drink\"",
    get amount() {
      return (Math.random() * (16 - 7) + 7).toFixed(2);
    },
  },
  {name: "Gym Membership", category: "\"General Services\"", amount: 85.0},
  {name: "Spotify", category: "\"General Services\"", amount: 12.0},
  {
    name: "Venmo Payment",
    category: "\"Transfer Out\"",
    get amount() {
      return (Math.random() * (30 - 25) + 25).toFixed(2);
    },
  },
  {
    name: "Venmo Payment",
    category: "\"Transfer Out\"",
    get amount() {
      return (Math.random() * (30 - 25) + 25).toFixed(2);
    },
  },
  {name: "Haircut", category: "\"General Services\"", amount: 18.0},
  {
    name: "Shell Gas Station",
    category: "\"Transportation\"",
    get amount() {
      return (Math.random() * (40 - 20) + 20).toFixed(2);
    },
  },
  {
    name: "Walmart",
    category: "\"General Merchandise\"",
    get amount() {
      return (Math.random() * (50 - 10) + 10).toFixed(2);
    },
  },
  {
    name: "CVS Pharmacy",
    category: "\"Other\"",
    get amount() {
      return (Math.random() * (50 - 40) + 40).toFixed(2);
    },
  },
];

export const CreateSampleUserData = async () => {
  const saltRounds = 4;

  const getHashedPassword = async () => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash("password", salt);
    return hash;
  };

  const hashedPW = await getHashedPassword();
  await User.findOrCreate({
    where: {username: "sample"},
    defaults: {password: hashedPW},
  });

  const end_date = new Date();
  const start_date = new Date();
  start_date.setDate(start_date.getDate() - 365);

  let investmentBalance = 100;
  let checkingBalance = 45;
  let savingsBalance = 60;

  let transaction_id = "1";

  for (
    let date = start_date;
    date <= end_date;
    date.setDate(date.getDate() + 1)
  ) {
    const formattedDate: string = format(date, "yyyy-MM-dd");

    await Balance.findOrCreate({
      where: {account_id: 1, date: formattedDate},
      defaults: {
        amount: investmentBalance,
        account_name: "Sample Investment Account",
        type: "investment",
        username: "sample",
      },
    });
    await Balance.findOrCreate({
      where: {account_id: 2, date: formattedDate},
      defaults: {
        amount: checkingBalance,
        account_name: "Sample Checking Account",
        type: "checking",
        username: "sample",
      },
    });
    await Balance.findOrCreate({
      where: {account_id: 3, date: formattedDate},
      defaults: {
        amount: savingsBalance,
        account_name: "Sample Savings Account",
        type: "savings",
        username: "sample",
      },
    });
    // random number between -10 and 30
    investmentBalance += Math.random() * 41 - 10;
    checkingBalance += Math.random() * 41 - 10;
    savingsBalance += Math.random() * 41 - 10;

    const randomTransaction =
      possible_transactions[
        Math.floor(Math.random() * possible_transactions.length)
      ];

    await Transaction.findOrCreate({
      where: {transaction_id: transaction_id},
      defaults: {
        date: formattedDate,
        username: "sample",
        ...randomTransaction,
      },
    });
    transaction_id = (parseInt(transaction_id) + 1).toString();
  }
  console.log("Finished seeding user \"sample\"");
};

export const UpdatePlaidUserData = async () => {
  let yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDay() - 1);
  const user_tokens = await UserToken.findAll();

  for (let i = 0; i < user_tokens.length; i++) {
    const req = {
      access_token: user_tokens[i].dataValues.access_token,
      start_date: format(yesterdayDate, "yyyy-MM-dd")
    };
    await axios
      .post(
        `${process.env.HOSTED_URL}/api/transactions/${user_tokens[i].dataValues.username}`,
        req
      )
      .then((_) => {
        functions.logger.log("Successfully retrieved recent transaction data for Plaid users.");
      })
      .catch((error) => {
        functions.logger.error(error.message);
      });

    await axios
      .post(
        `${process.env.HOSTED_URL}/api/balances/${user_tokens[i].dataValues.username}`,
        req
      )
      .then((_) => {
        functions.logger.log("Successfully retrieved recent balance data for Plaid users.");
      })
      .catch((error) => {
        functions.logger.error(error.message);
      });
  }
};

export const UpdateSampleUserData = async () => {
  try {
    const randomTransaction =
      possible_transactions[
        Math.floor(Math.random() * possible_transactions.length)
      ];
    const mostRecentTransaction = await Transaction.findOne({
      where: { username: 'sample' },
      order: [['createdAt', 'DESC']],
    });

    await Transaction.findOrCreate({
        where: { date: format(new Date(), "yyyy-MM-dd"), username: "sample" },
      defaults: {
        transaction_id: (parseInt(mostRecentTransaction?.dataValues.transaction_id) + 1).toString(),
        ...randomTransaction,
      },
    });

    functions.logger.log("Sample transactions update succeeded.");
  }
  catch(error) {
    functions.logger.error(error);
  }

  try {
    const mostRecentBalances = await Balance.findAll({
      where: { username: 'sample' },
      order: [['date', 'DESC']],
      limit: 3,
    });

    mostRecentBalances.forEach(async (balance) => { 
      await Balance.findOrCreate({
        where: {account_id: balance.dataValues.account_id, date: format(new Date(), "yyyy-MM-dd")},
        defaults: {
          amount: balance.dataValues.amount + Math.random() * 41 - 10,
          account_name: balance.dataValues.account_name,
          type: balance.dataValues.type,
          username: "sample",
        },
      })
    })
    functions.logger.log("Sample balances update succeeded.")
  }
  catch(error) {
    functions.logger.error(error);
  }
}