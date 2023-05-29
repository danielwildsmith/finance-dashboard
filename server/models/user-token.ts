import { DataTypes } from 'sequelize';
import { db } from '../utils/config';

export const UserToken = db.define("user_token", {
    access_token: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    username: DataTypes.STRING
});

(async () => {
    // To drop tables after each run: await db.sync({ force: true });
    await db.sync();
})();