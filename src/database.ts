import { Sequelize } from "sequelize-typescript";

const sequlize = new Sequelize("HwInfo", "admin", "123", {
  dialect: "sqlite",
  storage: __dirname + "./data/database.sqlite",
});

export default sequlize;
