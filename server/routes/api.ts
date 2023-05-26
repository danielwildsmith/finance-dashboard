import express from 'express';
import plaidRoute from './user-tokens';
import usersRoute from './users';
import transactionsRoute from './transactions';
import balancesRoute from './balances';

const router = express.Router();

router.use('/plaid', plaidRoute);
router.use('/users', usersRoute);
router.use('/transactions', transactionsRoute);
router.use('/balances', balancesRoute);

export default router;