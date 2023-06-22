import {Configuration, PlaidApi, PlaidEnvironments} from "plaid";
import {Sequelize} from "sequelize";

const configPlaid = new Configuration({
  basePath: PlaidEnvironments.development,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_DEVELOPMENT_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configPlaid);

// Configure MySQL database hosted on PlanetScale
export const db = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
      },
    },
    logging: false,
  }
);

export const ConnectDB = async () => {
  try {
    await db.authenticate();
    console.log("Connection to PlanetScale has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the PlanetScale database:", error);
  }
};
