import { Sequelize, Model, DataTypes } from 'sequelize';
import { db } from '../config';

export const User = db.define("user", {
    username: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    password: DataTypes.STRING
});

(async () => {
    // To drop tables after each run: await db.sync({ force: true });
    await db.sync();
})();