import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import apiRoute from './routes/api'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { db, ConnectDB } from './utils/config';
import { SeedDB } from './utils/seed';

const app : Express = express();
const port = process.env.SERVER_PORT || 8000;

ConnectDB();

// init middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/api', apiRoute);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

SeedDB();
db.sync();