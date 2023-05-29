// Database syncronization script hosted on Firebase to execute daily
// Also, when a new access_key is created, the db should be filled with all its data accordingly - separate func that takes in access_key
import { UserToken } from "./models/user-token";
import { Transaction } from "./models/transaction";
import { Balance } from "./models/balance";
import axios from 'axios';
import { format } from 'date-fns';

// Want to fill transactions and balance tables
// For each access_key, there are transactions and balances needed to be added
export const SeedDB = async () => {
    // Get all access_keys (with username as well)
    const user_tokens = await UserToken.findAll();
    for(let i = 0; i < user_tokens.length; i++) {
        // Make requests to Plaid API balances and transactions with each access_key

        const req = {
            access_token: user_tokens[i].dataValues.access_token
        }
        //@ts-ignore
        axios.post('http://localhost:8000/api/transactions/', req)
            .then(res => {
                //@ts-ignore
                res.data.forEach(transaction => { 
                    (async () => {
                        await Transaction.findOrCreate(
                            { 
                                where: { transaction_id: transaction.transaction_id },
                                defaults: 
                                    {
                                        date: transaction.date,
                                        name: transaction.merchant_name,
                                        category: JSON.stringify(transaction.category),
                                        amount: transaction.amount,
                                        username: user_tokens[i].dataValues.username
                                    }
                            }
                        );
                    })();
                });
            }) 
            .catch(error => {
                console.error(error);
            });

        axios.post('http://localhost:8000/api/balances/', req)
            .then(res => {
                const currentDate = new Date();
                const formattedDate : string = format(currentDate, 'yyyy-MM-dd');

                //@ts-ignore
                res.data.forEach(account => { 
                    (async () => {
                        await Balance.findOrCreate(
                            { 
                                where: { account_id: account.account_id, date: formattedDate},
                                defaults: 
                                    {
                                        amount: account.balances.current,
                                        account_name: account.name,
                                        type: account.subtype,
                                        username: user_tokens[i].dataValues.username
                                    }
                            }
                        );
                    })();
                });
            })
            .catch(error => {
                console.error(error);
            });
    }
};



