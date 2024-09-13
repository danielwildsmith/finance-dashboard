# Finance Dashboard Website [Offline]
#### A full-stack web application that aggregates data from multiple banking accounts into a centralized platform, powered by the Plaid API.
![Screenshot (15)](https://github.com/danielwildsmith/finance-dashboard/assets/92833122/d1dcd311-b693-43e9-a347-8d407943e08f)

## Table of Contents
- [Description](#description)
- [Installation and Usage](#installation-and-usage)
  * [Client Setup](#client-setup)
  * [Server Setup](#server-setup)
- [Rest API Documentation](#rest-api-documentation)
  * [Transactions](#transactions)
  * [Balances](#balances)
  * [Users](#users)
  * [User Tokens and Plaid Configuration](#user-tokens-and-plaid-configuration)
- [License](#license)

## Description
Through the React frontend, users can easily gain financial insights by viewing detailed and up-to-date charts and graphs, including net worth over time and month-to-month transaction comparisons. The website also features a Material UI table where users can verify and add notes to transactions.

The backend was built using Express and is deployed using Firebase Cloud Functions and includes JWT authentication for secure user access. A daily background job updates the MySQL database with the latest transaction and balance data.

For easy exploration, the website provides sample data accessible with the following credentials - username: **sample**, password: **password**. Please note that linking your personal financial accounts involves risks that should be considered.

### Update 03/22/2024
Website is no longer running - Planetscale database removed its free tier. I used this to track my finances for almost a year, it was awesome!

The Plaid API is a powerful tool but its limitations (e.g. it is unable to connect to many banks/credit unions) have caused me to discontinue this project's development. I am still searching for the perfect budgeting solution.

Still though, this project was a massive stepping stone in my development journey. It isn't perfect, but I learned a lot from it. I hope you find it useful in some way.

## Installation and Usage
Pre-requisite: Node.js must be installed.
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
4. Run ```npm run dev``` to start the server in development mode

#### Server Deployment
Run ```npm run deploy``` to deploy the server to Firebase Cloud Functions

## Rest API Documentation
### Transactions
### POST ```/transactions/:username```
- Description: Used to seed the database with transactions of a new user.
- Parameters:
  * ```username```: The username of the account holder
- Request Body:
  * ```access_token```: The Plaid permanent access token for the user's accounts
  * ```start_date```: The start date for fetching transactions (format: "YYYY-MM-DD")
- Response:
  * ```200 OK```: Returns an array of Transaction objects
      ```
      [
        {
          "transaction_id": "12345",
          "date": "2024-09-01",
          "name": "Grocery Store",
          "amount": 50.25,
          "category": "Food and Drink",
          "note": "",
          "verified": false,
          "username": "user123"
        },
        ...
      ]
      ```
  * ```400 Bad Request```: Returns an error message if the access token is invalid

### GET ```/transactions/categorized/:username/:yyyy/:mm```
- Description: Get transaction totals of each category for the specified month and the previous month for a specified user.
- Headers:
  * ```Authorization```: JWT token
- Parameters:
  * ```username```: The username of the account holder
  * ```yyyy```: Year (4 digits)
  * ```mm```: Month (2 digits)
- Response:
  - ```200 OK```: Returns an array of CategoryData objects
      ```
      [
        {
          "category": "Food and Drink",
          "month": "2024-09",
          "amount": 300.00,
          "previous_month": "2024-08",
          "previous_month_amount": 250.00
        },
        ...
      ]
      ```

### GET ```/transactions/totals/:username/:yyyy/:mm```
- Description: Get the transaction totals for each category of the specified month, previous month, and the penultimate month for a specified user.
- Headers:
  * ```Authorization```: JWT token
- Parameters:
  * ```username```: The username of the account holder
  * ```yyyy```: Year (4 digits)
  * ```mm```: Month (2 digits)
- Response:
  * ```200 OK```: Returns an array of MonthlyTotalData objects
      ```
      [
        {
          "month": "2024-09";
          "Food And Drink": 100.00;
          "General Merchandise": 50.00;
          Transportation: 30.00;
          "Rent And Utilities": 800.00;
          Travel: 0.00;
          "Transfer Out": 300.00;
          "General Services": 20.00;
          Other: 0.00;
          total: 1300;
        },
        {
          "month": "2024-08";
          ...
        },
        ...
      ]
      ```

### GET ```/transactions/:username/:yyyy/:mm```
- Description: Get all transactions for a specified user in a specified month ordered by date in ascending order.
- Headers:
  * ```Authorization```: JWT token
- Parameters:
  * ```username```: The username of the account holder
  * ```yyyy```: Year (4 digits)
  * ```mm```: Month (2 digits)
- Response:
  * ```200 OK```: Returns an array of TransactionRow objects
      ```
      [
        {
          id: "12345";
          date: "2024-09-01";
          name: "Grocery Store";
          category: "Food and Drink";
          amount: 50.25;
          note: "";
          verified: false;
        },
        ...
      ]
      ```

### GET ```/transactions/comparison/:username```
- Description: Get the total amount of transactions in the last 30 days and the 30 days before that for a specified user.
- Headers:
  * ```Authorization```: JWT token
- Parameters:
  * ```username```: The username of the account holder
- Response:
  * ```200 OK```: Returns a MonthlyAmountComparison object
      ```
      {
        recentAmount: 906.00;
        previousAmount: 812.00;
        available: true;
      }
      ```

### PUT ```/transactions/note/:id```
- Description: Update the note of a transaction.
- Parameters:
  * ```id```: The transaction ID
- Request Body:
  * ```note```: The new note content
  * ```category```: The transaction category
- Response:
  * ```200 OK```: Returns the updated TransactionRow object
      ```
      {
        id: "12345";
        date: "2024-09-01";
        name: "Grocery Store";
        category: "Food and Drink";
        amount: 50.25;
        note: "Fruits and vegetables. And beer.";
        verified: false;
      }
      ```
  * ```404 Not Found```: Returns an error object if the transaction is not found

### PUT ```/transactions/verify/:id```
- Description: Update the verification status of a transaction.
- Parameters:
  * ```id```: The transaction ID
- Request Body:
  * ```verified``` (boolean): New verification status
  * ```category```: Transaction category
- Response:
  * ```200 OK```: Returns the updated TransactionRow object
  * ```404 Not Found```: Returns an error object if the transaction is not found

### Balances
### POST ```/balances/:username```
- Description: Used to seed the database with balance information of a new user
- Parameters:
  * ```username```: The username of the account holder
- Request Body:
  * ```access_token```: Plaid access token for the user's accounts
- Response:
  * ```200 OK```: Returns an array of account objects with balance information
  * ```400 Not Found```: Returns an error message if the access token is invalid

### GET ```/balances/current/:username```
- Description: Get all current balance records of a specified user.
- Headers:
  * ```Authorization```: JWT token
- Parameters:
  * ```username```: The username of the account holder
- Response:
  * ```200 OK```: Returns an array of TypedBalance objects or an empty array if no balances are found
      ```
      [
        {
          type: "checking";
          total: 1000.00;
        },
        {
          type: "savings";
          total: 5000.00;
        },
        ...
      ]
      ```

### GET ```/balances/history/:username```
- Description: Get all balance records of a specified user ordered by date in ascending order.
- Headers:
  * ```Authorization```: JWT token
- Parameters:
  * ```username```: The username of the account holder
- Response:
  * ```200 OK```: Returns an array of DatedNetWorth objects
      ```
      [
        {
          date: "2024-09-01";
          netWorth: 6000.00;
        },
        ...
      ]
      ```

### GET ```/balances/comparison/:username```
- Description: Get current and previous month balances of user for comparison
- Headers:
  * ```Authorization```: JWT token
- Parameters:
  * ```username```: The username of the account holder
- Response:
  * ```200 OK```: Returns an array of MonthlyAmountComparison objects
      ```
      [
        {
          recentAmount: 6000.00;
          previousAmount: 5000.00;
          available: true;
        },
        ...
      ]
      ```

### Users
### POST ```/users/signup```
- Description: Create a new user account
- Request Body:
  * ```username```: Username
  * ```password```: Password
- Response:
  * ```200 OK```: Returns a JWT token for authentication
  * ```400 Bad Request```: Missing username/password in request body OR other error
  * ```409 Conflict```: Username already exists

### POST ```/users/signin```
- Description: Sign in to an existing user account
- Request Body:
  * ```username```: Username
  * ```password```: Password
- Response:
  * ```200 OK```: Returns a JWT token for authentication
  * ```400 Bad Request```: Missing username/password in request body OR other error
  * ```401 Unauthorized```: Incorrect credentials provided
  * ```404 Not Found```: User not found

### User Tokens and Plaid Configuration
Note: refer to Plaid API documentation for more information on Plaid API endpoints

### POST ```/user-tokens/:username```
- Description: Create a Plaid Link token for a user. This token is used to initialize the Plaid Link flow.
- Headers:
  * ```Authorization```: JWT token
- Parameters:
  * ```username```: The username of the account holder
- Response:
  * ```200 OK```: Returns a Plaid link token
  * ```500 Internal Server Error```: Returns an error message if the token cannot be created (usually a problem connecting to the Plaid API)

### POST ```/user-tokens/create/:username```
- Description: Create a permanent access token for a user in exchange for a Plaid Link token to be stored.
- Headers:
  * ```Authorization```: JWT token
- Parameters:
  * ```username```: The username of the account holder
- Request Body:
  * ```public_token```: Public/Link token from Plaid Link
- Response:
  * ```200 OK```: Returns a Plaid link token
  * ```500 Internal Server Error```: Returns an error message if the token cannot be created (usually a problem connecting to the Plaid API)

### GET ```/user-tokens/:username```
- Description: Get a user's permanent access token
- Headers:
  * ```Authorization```: JWT token
- Parameters:
  * ```username```: The username of the account holder
- Response:
  - ```200 OK```: Returns a Plaid permanent access token

### License
This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details
