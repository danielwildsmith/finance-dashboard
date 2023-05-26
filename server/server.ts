import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import apiRoute from './routes/api'
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import { db, ConnectDB } from './config';
import { SeedDB } from './seed';

const app : Express = express();
const port = process.env.PORT || 8000;

ConnectDB();

// init middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieSession({
  name: "login-token",
  secret: process.env.COOKIE_SECRET,
  httpOnly: true
}));

app.use('/api', apiRoute);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

SeedDB();
db.sync();