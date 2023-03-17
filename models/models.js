// const { Schema, model, ObjectId } = require("mongoose");
// const User = new Schema({
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   diskSpace: { type: Number, default: 1024 ** 3 * 10 },
//   usedSpace: { type: Number, default: 0 },
//   avatar: { type: String },
//   files: [{ type: ObjectId, ref: "File" }],
// });
// module.exports = model("User", User);

// const sequelize = require("../db");
// const { DataTypes } = require("sequelize");
// const User = sequelize.define("user", {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   email: { type: DataTypes.STRING, unique: true },
//   password: { type: DataTypes.STRING },
//   diskSpace: { type: DataTypes.NUMBER, defaultValue: 1024 ** 3 * 10 },
//   usedSpace: { type: DataTypes.NUMBER, defaultValue: 0 },
//   avatar: { type: DataTypes.STRING },
// });

// const File = sequelize.define("files", {
//   id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//   name: { type: DataTypes.STRING, allowNull: false },
//   type: { type: DataTypes.STRING, allowNull: false },
//   accessLink: { type: DataTypes.STRING },
//   size: { type: DataTypes.NUMBER, defaultValue: 0 },
//   path: { type: DataTypes.STRING, defaultValue: "" },
// });
// User.hasMany(File);
// File.belongsTo(User);
const Uuid = require("uuid");
const sequelize = require("./config/db.config");
const { DataTypes } = require("sequelize");

const User = sequelize.define("Profiles", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  diskSpace: {
    type: DataTypes.BIGINT,
    defaultValue: 1024 ** 3 * 10,
  },
  usedSpace: { type: DataTypes.INTEGER, defaultValue: 0 },
  avatar: { type: DataTypes.STRING },
  files: { type: DataTypes.ARRAY(DataTypes.STRING) },
});
const File = sequelize.define("FileStorage", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
  accessLink: { type: DataTypes.STRING },
  size: { type: DataTypes.INTEGER, defaultValue: 0 },
  date: { type: DataTypes.DATE, defaultValue: Date.now() },
  user: { type: DataTypes.UUID },
  path: { type: DataTypes.STRING, defaultValue: "" },
  parent: { type: DataTypes.JSONB, defaultValue: null },
  childs: { type: DataTypes.ARRAY(DataTypes.STRING) },
  chosen: { type: DataTypes.BOOLEAN, defaultValue: false },
  lastOpen: { type: DataTypes.DATE, defaultValue: null },
  // associate: models => {
  //   File.hasOne (models.enviornment, {
  //       foreignKey: { name: 'client_id', allowNull: false }
  //   });
  // },
});
User.hasMany(File);
File.belongsTo(User);

module.exports = { User, File };
// module.exports = {
//   User,
//   File,
// };
// const File = new Schema({
//   name: { type: String, required: true },
//   type: { type: String, required: true },
//   accessLink: { type: String },
//   size: { type: Number, default: 0 },
//   path: { type: String, default: "" },
//   date: { type: Date, default: Date.now() },
//   user: { type: ObjectId, ref: "User" },
//   parent: { type: ObjectId, ref: "File" },
//   childs: [{ type: ObjectId, ref: "File" }],
// });
