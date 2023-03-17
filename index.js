const express = require("express");
const sequelize = require("./config/db.config");
const dotenv = require("dotenv");
const models = require("./models/models");
const fileUpload = require("express-fileupload");
const authRouter = require("./routes/auth.routes");
const fileRouter = require("./routes/file.routes");
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;
console.log("this port", PORT);
const corsMiddleWare = require("./middleware/cors.middleware");
app.use(fileUpload({}));
app.use(corsMiddleWare);

app.use(express.json());
app.use(express.static("static"));
app.use("/api/auth", authRouter);
app.use("/api/files", fileRouter);
const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (e) {}
};

start();
