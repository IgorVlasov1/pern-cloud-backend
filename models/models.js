const Uuid = require("uuid");
const sequelize = require("../config/db.config");
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
});
User.hasMany(File);
File.belongsTo(User);

module.exports = { User, File };
