# Finance Dashboard Website [Offline]
#### A full-stack web application that aggregates data from multiple banking accounts into a centralized platform, powered by the Plaid API.
![Screenshot (15)](https://github.com/danielwildsmith/finance-dashboard/assets/92833122/d1dcd311-b693-43e9-a347-8d407943e08f)

## Table of Contents
- [Description](#description)
- [Installation and Usage](#installation-and-usage)
  * [Client Setup](#client-setup)
  * [Server Setup](#server-setup)
- [Rest API Documentation](#rest-api)
  * [Transactions](#transactions)
  * [Balances](#balances)
  * [Net Worth](#net-worth)
  * [Users](#users)
  * [User Tokens and Plaid Configuration](#user-tokens-and-plaid-configuration)
- [License](#license)
- [Bonus Message](#bonus-message)

## Description
Through the React frontend, users can easily gain financial insights by viewing detailed and up-to-date charts and graphs, including net worth over time and month-to-month transaction comparisons. The website also features a Material UI table where users can verify and add notes to transactions.

The backend was built using Express and is deployed using Firebase Cloud Functions and includes JWT authentication for secure user access. A daily background job updates the MySQL database with the latest transaction and balance data.

For easy exploration, the website provides sample data accessible with the following credentials - username: **sample**, password: **password**. Please note that linking your personal financial accounts involves risks that should be considered.

### Update 03/22/2024
Website is no longer running - Planetscale database removed its free tier. I used this to track my finances for almost a year, it was awesome!


## Installation and Usage
### Client Setup
1. Navigate to the client directory: ```cd client```
2. Install dependencies: ```npm install```
3. Create a .env file in the client directory with the following variables:
```
REACT_APP_API_URL=server_url
```
4. Run ```npm start``` to start the client in development mode

#### Client Deployment
Run ```npm run deploy``` to deploy the client to GitHub Pages

### Server Setup
1. Navigate to the server directory: ```cd server```
2. Install dependencies: ```npm install```
3. Create a .env file in the server directory with the following variables:
```
DB_NAME=your_database_name
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_HOST=your_database_host
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_DEVELOPMENT_SECRET=your_plaid_development_secret
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```
###### Notes
- Change NODE_ENV to production when deploying.
- The Plaid client ID and secret can be obtained by creating an account at https://plaid.com/
4. ```npm run dev``` to start the server in development mode

#### Server Deployment
Run ```npm run deploy``` to deploy the server to Firebase Cloud Functions.

## Rest API
Notes:
- Most endpoints require a valid JWT token in the Authorization header.
- The parameter ```username``` seen in many paths is the username of the account holder.

### Transactions
1. Create new user transactions (used for seeding database)

```POST /transactions/:username```
- Request Body:
  - ```access_token``` (string): Plaid access token for the user's accounts
  - ```start_date``` (string): Start date for fetching transactions (format: "YYYY-MM-DD")
- Response:
  - Status 200: Returns an array of transaction objects
  ```
  type Transaction = {
    transaction_id: string;
    date: string;
    name: string;
    amount: number;
    category: string;
    note: string;
    verified: boolean;
    username: string;
  };
  ```
  - Status 400: Returns an error object if the request fails

2. Get categorized transactions of last two months

```GET /transactions/categorized/:username/:yyyy/:mm```
- Parameters:
  - ```yyyy```: Year (4 digits)
  - ```mm```: Month (2 digits)
- Response:
  - Status 200: Returns an array of CategoryData objects
  ```
  interface CategoryData {
    category: string;
    month: string;
    previous_month: string;
    amount: number;
    previous_month_amount: number;
  }
  ```

3. Get transaction totals of user from the last three months

```GET /transactions/totals/:username/:yyyy/:mm```
- Parameters:
  - ```yyyy```: Year (4 digits)
  - ```mm```: Month (2 digits)
- Response:
  - Status 200: Returns an array of MonthlyTotalData objects
  ```
  interface MonthlyTotalData {
    month: string;
    "Food And Drink": number;
    "General Merchandise": number;
    Transportation: number;
    "Rent And Utilities": number;
    Travel: number;
    "Transfer Out": number;
    "General Services": number;
    Other: number;
    total: number;
  }
  ```
4. Get all transactions for a specific month

```GET /transactions/:username/:yyyy/:mm```
- Parameters:
  - ```yyyy```: Year (4 digits)
  - ```mm```: Month (2 digits)
- Response:
  - Status 200: Returns an array of TransactionRow objects
  ```
  interface TransactionRow {
    id: string;
    date: string;
    name: string;
    category: string;
    amount: number;
    note: string;
    verified: boolean;
  }
  ```

5. Update transaction note

```PUT /transactions/note/:id```
- Parameters:
  - ```id```: Transaction ID
- Request Body:
  - ```note``` (string): New note content
  - ```category``` (string): Transaction category
- Response:
  - Status 200: Returns the updated TransactionRow object
  - Status 404: Returns an error object if the transaction is not found

6. Update transaction verification status

```PUT /transactions/verify/:id```
- Parameters:
  - ```id```: Transaction ID
- Request Body:
  - ```verified``` (boolean): New verification status
  - ```category``` (string): Transaction category
- Response:
  - Status 200: Returns the updated TransactionRow object
  - Status 404: Returns an error object if the transaction is not found

7. Get transaction totals of the last 30 days and the 30 days before that

```GET /transactions/comparison/:username```
- Response:
  - Status 200: Returns a MonthlyAmountComparison object
  ```
  interface MonthlyAmountComparison {
    recentAmount: number;
    previousAmount: number;
    available: boolean;
  }
  ```

### Balances
1. Create new user balance entry

```POST /balances/:username```
- Request Body:
  - ```access_token``` (string): Plaid access token for the user's accounts
- Response:
  - Status 200: Returns an array of account objects with balance information
  - Status 400: Returns an error object if the request fails

2. Get current balances of user

```GET /balances/current/:username```
- Response:
  - Status 200: Returns an array of TypedBalance objects or an empty array if no balances are found
  ```
  interface TypedBalance {
    type: string;
    total: number;
  }
  ```

3. Get historical balances of user

```GET /balances/history/:username```
- Response:
  - Status 200: Returns an array of DatedNetWorth objects
  ```
  interface DatedNetWorth {
    date: string;
    Total: number;
  }
  ```

4. Get current and previous month balances of user for comparison

```GET /balances/comparison/:username```
- Response:
  - Status 200: Returns an array of MonthlyAmountComparison objects
  ```
  interface MonthlyAmountComparison {
    recentAmount: number;
    previousAmount: number;
    available: boolean;
  }
  ```

### Users
1. Create new user

```POST /users/signup```
- Request Body:
  - ```username``` (string): Username
  - ```password``` (string): Password
- Response:
  - Status 200: Returns a JWT token for authentication
  - Status 400: Missing username/password in request body OR other error
  - Status 409: Username already exists

2. Sign in user

```POST /users/signin```
- Request Body:
  - ```username``` (string): Username
  - ```password``` (string): Password
- Response:
  - Status 200: Returns a JWT token for authentication
  - Status 400: Missing username/password in request body OR other error
  - Status 401: Incorrect credentials provided
  - Status 404: User not found

### User Tokens and Plaid Configuration
Note: refer to Plaid API documentation for more information on Plaid API endpoints

1. Create a Plaid Link token for a user

```POST /user-tokens/:username```
- Response:
  - Status 200: Returns a Plaid link token
  - Status 500: Server Error

2. Create a permanent access token for a user in exchange for a Plaid Link token

```POST /user-tokens/create/:username```
- Request Body:
  - ```public_token``` (string): Public/Link token from Plaid Link
- Response:
  - Status 200: Returns a Plaid permanent access token to be stored
  - Status 500: Server Error

3. Get a user's permanent access token

```GET /user-tokens/:username```
- Response:
  - Status 200: Returns a Plaid permanent access token

### License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

### Bonus Message
This project was a massive stepping stone in my development journey. It isn't perfect, but I learned a lot from it. I hope you find it useful in some way. Thank you for reading this far.
