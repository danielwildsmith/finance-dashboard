import {DataTypes} from "sequelize";
import {db} from "../utils/config";

export const Balance = db.define("balance", {
  balance_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  account_id: DataTypes.STRING,
  date: DataTypes.DATEONLY,
  amount: DataTypes.DOUBLE,
  account_name: DataTypes.STRING,
  type: DataTypes.STRING,
  username: DataTypes.STRING,
});

(async () => {
  // To drop tables after each run: await db.sync({ force: true });
  await db.sync();
})();
