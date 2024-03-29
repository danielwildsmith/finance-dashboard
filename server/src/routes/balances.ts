import express, {Request, Response} from "express";
import {plaidClient} from "../utils/config";
import {AccountsBalanceGetRequest} from "plaid";
import {Balance} from "../models/balance";
import {format} from "date-fns";
import { authenticateUser } from "../utils/auth";

interface TypedBalance {
  type: string;
  total: number;
}

interface DatedNetWorth {
  date: string;
  Total: number;
}

interface MonthlyAmountComparison {
  recentAmount: number;
  previousAmount: number;
  available: boolean;
}

const router = express.Router();

router.post("/:username", async function(req: Request, res: Response) {
  const username = req.params.username;

  const balancesReq: AccountsBalanceGetRequest = {
    access_token: req.body.access_token,
  };

  try {
    const response = await plaidClient.accountsBalanceGet(balancesReq);
    response.data.accounts.forEach((account) => {
      if(account.type != 'credit') {
        (async () => {
          await Balance.findOrCreate({
            where: {account_id: account.account_id, date: format(new Date(), "yyyy-MM-dd")},
            defaults: {
              amount: account.balances.current,
              account_name: account.name,
              type: account.subtype,
              username: username,
            },
          });
        })();
      }
    });
    res.status(200).send(response.data.accounts);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});

// for current net worth and breakdown by type charts
router.get("/current/:username", authenticateUser, async function(req: Request, res: Response) {
  const username: string = req.params.username;
  const currentDate = new Date();
  const formattedDate: string = format(currentDate, "yyyy-MM-dd");

  // find all balance records associated with this username
  const balances = await Balance.findAll({
    where: {
      username: username,
      date: formattedDate,
    },
  });

  if (balances.length === 0) {
    res.send(balances);
    return;
  }

  const type_totals_map: { [type: string]: number } = {};
  balances.forEach((balance) => {
    const type: string = balance.dataValues.type;
    if (type_totals_map[type]) {
      type_totals_map[type] = Number(
        (type_totals_map[type] + balance.dataValues.amount).toFixed(2)
      );
    } else {
      type_totals_map[type] = Number(balance.dataValues.amount.toFixed(2));
    }
  });

  const currentBalances: TypedBalance[] = [];
  for (const [key, value] of Object.entries(type_totals_map)) {
    currentBalances.push({type: key, total: value});
  }

  res.status(200).send(currentBalances);
});

// for net worth over time graph
router.get("/history/:username", authenticateUser, async function(req: Request, res: Response) {
  const username: string = req.params.username;
  const currentDate = new Date();
  const datedNetWorths: DatedNetWorth[] = [];

  // maximum 13 data points should be returned
  for (let i = 0; i < 13; i++) {
    const dbDate = format(currentDate, "yyyy-MM-dd");
    const balances = await Balance.findAll({
      where: {
        username: username,
        date: dbDate,
      },
    });

    if (balances.length === 0) {
      break;
    }

    let netWorth = 0;
    balances.forEach((balance) => {
      netWorth += balance.dataValues.amount;
    });

    datedNetWorths.push({
      date: format(currentDate, "MM-dd-yyyy"),
      Total: netWorth,
    });
    currentDate.setDate(currentDate.getDate() - 7);
  }

  res.status(200).send(datedNetWorths.reverse());
});

// for dashboard balance card - data on last 30 days vs previous 30 days
router.get(
  "/comparison/:username", authenticateUser, 
  async function(req: Request, res: Response) {
    const username: string = req.params.username;
    const date = new Date();
    let formattedDate = format(date, "yyyy-MM-dd");

    let recentAmount = 0;
    let previousAmount = 0;

    // get total of balances on current date
    const recentBalances = await Balance.findAll({
      where: {
        username: username,
        date: formattedDate,
      },
    });

    recentBalances.forEach(
      (balance) => (recentAmount += balance.dataValues.amount)
    );

    date.setDate(date.getDate() - 30);
    formattedDate = format(date, "yyyy-MM-dd");

    const previousBalances = await Balance.findAll({
      where: {
        username: username,
        date: formattedDate,
      },
    });

    previousBalances.forEach(
      (balance) => (previousAmount += balance.dataValues.amount)
    );

    // comparison can only really be made after 30 days has passed
    const available = previousAmount === 0 ? false : true;
    const comparisonData: MonthlyAmountComparison = {
      recentAmount: recentAmount,
      previousAmount: previousAmount,
      available: available,
    };
    res.status(200).send(comparisonData);
  }
);

export default router;
