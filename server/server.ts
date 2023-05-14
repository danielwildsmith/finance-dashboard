import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import apiRoute from './routes/api'
import bodyParser from 'body-parser';

const app : Express = express();
const port = process.env.PORT || 8000;

// init middleware
app.use(bodyParser.json());
app.use('/api', apiRoute);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

//already within the signup/login process, user wants to connect their bank.

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});