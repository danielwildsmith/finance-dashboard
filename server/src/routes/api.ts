import express from "express";
import userTokensRoute from "./user-tokens";
import usersRoute from "./users";
import transactionsRoute from "./transactions";
import balancesRoute from "./balances";

const router = express.Router();

router.use("/user-tokens", userTokensRoute);
router.use("/users", usersRoute);
router.use("/transactions", transactionsRoute);
router.use("/balances", balancesRoute);

export default router;
