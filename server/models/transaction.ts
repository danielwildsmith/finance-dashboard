import { DataTypes } from 'sequelize';
import { db } from '../config';

export const Transaction = db.define("transaction", {
    transaction_id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    date: DataTypes.DATEONLY,
    name: DataTypes.STRING,
    category: DataTypes.STRING,
    amount: DataTypes.DOUBLE,
    note: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0
    },
    username: DataTypes.STRING
});

(async () => {
    // To drop tables after each run: await db.sync({ force: true });
    await db.sync();
})();