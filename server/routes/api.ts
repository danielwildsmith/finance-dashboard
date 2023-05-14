import express from 'express';
const router = express.Router();

import plaidRoute from './plaid';

router.use('/plaid', plaidRoute);

export default router;