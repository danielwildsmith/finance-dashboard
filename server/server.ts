import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import apiRoute from './routes/api'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { db, ConnectDB } from './utils/config';
import { CreateSampleUserData } from './utils/seed';
import * as functions from 'firebase-functions';

const app : Express = express();

ConnectDB();

// init middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'https://danielwildsmith.github.io'];  
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin as string);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  next() // Pass control to the next middleware or route handler
});


app.use('/api', apiRoute);

app.listen(() => {
  console.log(`[server]: Server is running at http://localhost:${8000}`);
});

// CreateSampleUserData();
db.sync();

exports.api = functions.https.onRequest(app);