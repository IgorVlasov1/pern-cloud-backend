const Sequelize = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const { DB_NAME, DB_PASSWORD, DB_USER, DB_URI } = process.env;

// connect to db locally
// const db = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
//   host: "localhost",
//   dialect: "postgres",
//   define: {
//     timestamps: false,
//   },
//   pool: {
//     max: 5,
//     min: 0
//     acquire: 30000,
//     idle: 10000,
//   },
// });

// connect to remote db
const db = new Sequelize(DB_URI, {
  define: {
    timestamps: false,
  },
});

module.exports = db;
