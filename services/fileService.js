const fs = require("fs");
const { User, File } = require("../models/models");
const rimraf = require("rimraf");
const path = require("path");
class FileService {
  createDir(file) {
    const filePath = path.join(
      __dirname,
      `../files/${file.dataValues.user}/${file.dataValues.path}`
    );

    console.log("Filepath: ", filePath);
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath, { recursive: true });
          return resolve({ message: "File was created" });
        } else {
          return reject({ message: "File already exists" });
        }
      } catch (e) {
        return reject({ message: "File error" });
      }
    });
  }

  deleteFile(file) {
    console.log("Deleting", file.dataValues);
    const path = this.getPath(file);
    console.log("Путь до файла: ", path);
    if (file.dataValues.type === "dir") {
      fs.rmSync(path, { recursive: true, force: true });
    } else {
      fs.unlinkSync(path);
    }
  }

  getPath(file) {
    return path.join(
      __dirname,
      `../files/${file.dataValues.user}/${file.dataValues.path}`
    );
  }
}

module.exports = new FileService();
