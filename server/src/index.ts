import admin from 'firebase-admin';
admin.initializeApp();
import express, {Express} from 'express';
import dotenv from 'dotenv';
dotenv.config();
import apiRoute from './routes/api'
import bodyParser from 'body-parser';
import { db, ConnectDB } from './utils/config';
import { UpdatePlaidUserData, UpdateSampleUserData } from './utils/seed';
import * as functions from 'firebase-functions';
// import { UpdateSampleUserData } from './utils/seed';

const app : Express = express();

ConnectDB();

// init middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'https://danielwildsmith.github.io'];  
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin as string);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); 
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    // Handle preflight request
    res.status(200).end();
  } else {
    // Pass control to the next middleware or route handler
    next();
  }
});

if(process.env.NODE_ENV == "development") {
  app.use('/api', apiRoute);
  const port = 8000;
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}
else if(process.env.NODE_ENV == "production") {
  app.use('/', apiRoute);
}

db.sync();

exports.api = functions.https.onRequest((req, res) => {
  // Set the CORS headers manually
  const allowedOrigins = ['http://localhost:3000', 'https://danielwildsmith.github.io'];  
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin as string);
  }
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');

  // Handle the preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  // Forward the request to the Express app
  app(req, res);
});

exports.updateUserData = functions.pubsub.schedule('every day 21:01').onRun(async () => {
  await ConnectDB(); 
  await UpdatePlaidUserData();
  await UpdateSampleUserData();
  await db.sync();
});