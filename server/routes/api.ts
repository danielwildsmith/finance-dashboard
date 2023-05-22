import express from 'express';
const router = express.Router();

import plaidRoute from './plaid';
import usersRoute from './users';

router.use('/plaid', plaidRoute);
router.use('/users', usersRoute);

export default router;