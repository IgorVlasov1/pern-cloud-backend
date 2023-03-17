const { User, File } = require("../models/models");
const fileService = require("../services/fileService");
const dirSize = require("../utils/sizeDir");
const Uuid = require("uuid");
const fs = require("fs");
const path = require("path");
const dateCompare = require("../utils/compareDates");

class FileController {
  async createDir(req, res) {
    try {
      const { name, type, parent } = req.body;
      const file = await File.create({ name, type, parent, user: req.user.id });
      const parentFile = await File.findByPk(parent);
      console.log(parentFile);

      if (parentFile == null) {
        file.path = name;
        await file.update({ path: name });
      } else {
        await file.update({ path: `${parentFile.path}\\${file.name}` });
        const updateArray = Array(parentFile.childs);
        updateArray.push(file.id);
        console.log(updateArray);
        await File.update(
          {
            childs: updateArray,
          },
          {
            where: {
              id: parent,
            },
          }
        );
      }
      await fileService.createDir(file);
      return res.json(file);
    } catch (e) {
      console.log(e);
      return res.status(400).json(e);
    }
  }
  async getFiles(req, res) {
    console.log("OTEC", req.query.parent);
    try {
      const { sort, chosen } = req.query;
      let files;
      console.log(chosen);
      if (sort == undefined) {
        files = await File.findAll({
          where: { user: req.user.id, parent: req.query.parent || null },
        });
      }

      if (sort != undefined) {
        files = await File.findAll({
          order: [[`${sort}`, "DESC"]],
          where: { user: req.user.id, parent: req.query.parent || null },
        });
      }

      if (chosen == "lastOpen") {
        if (req.query.parent == undefined) {
          files = await File.findAll({
            where: {
              user: req.user.id,
            },
          });

          files = files.filter(
            (file) =>
              dateCompare(file.dataValues.lastOpen) &&
              file.dataValues.lastOpen != null
          );
        }
        if (req.query.parent != undefined) {
          let childs = await File.findAll({
            where: {
              parent: req.query.parent,
            },
          });
          console.log("ДЕТИ МОИ", childs);
          files = childs;
        }
      }
      if (chosen == "chosen") {
        if (req.query.parent !== undefined) {
          files = await File.findAll({
            where: {
              user: req.user.id,
              parent: req.query.parent,
            },
          });
        }
        if (req.query.parent == undefined) {
          files = await File.findAll({
            where: {
              user: req.user.id,
              chosen: true,
            },
          });
        }
      }

      return res.json(files);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Can not get files" });
    }
  }

  async uploadFile(req, res) {
    try {
      const file = req.files.file;
      let parent;
      if (req.body.parent != undefined) {
        parent = await File.findOne({
          where: {
            user: req.user.id,
            id: req.body.parent,
          },
        });
      }
      const user = await User.findByPk(req.user.id);
      if (user.dataValues.usedSpace + file.size > user.dataValues.diskSpace) {
        return res.status(400).json({ message: "There no space on the disk" });
      }
      // let sizeOfDirUser = user.dataValues.usedSpace + file.size;
      user.usedSpace = user.dataValues.usedSpace + file.size;
      user.save();
      let pathFile;
      let oneFilePath;
      if (parent !== undefined) {
        oneFilePath = parent.dataValues.path + "\\" + file.name;
        pathFile = path.join(
          __dirname,
          `../files/${user.dataValues.id}/${parent.dataValues.path}/${file.name}`
        );
        console.log("Путь", pathFile);
      } else {
        oneFilePath = file.name;
        pathFile = path.join(
          __dirname,
          `../files/${user.dataValues.id}/${file.name}`
        );
      }

      if (fs.existsSync(pathFile)) {
        return res.status(400).json({ message: "File already exists" });
      }

      file.mv(pathFile);
      const type = file.name.split(".").pop();

      if (parent !== undefined) {
        (async () => {
          const size = await dirSize(
            path.join(
              __dirname,
              `../files/${user.dataValues.id}/${parent.dataValues.path}`
            )
          );
          await File.update(
            {
              size: size + file.size,
            },
            { where: { user: req.user.id, id: req.body.parent } }
          );
        })();
      }
      console.log("tet", parent);
      const dbFile = await File.create({
        name: file.name,
        type,
        size: file.size,
        path: oneFilePath,
        parent: parent.dataValues == undefined ? null : parent.dataValues.id,
        user: user.id,
      });

      res.json({
        dbFile,
        user,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Upload error" });
    }
  }

  async downloadFile(req, res) {
    try {
      const file = await File.findOne({
        where: { id: req.query.id, user: req.user.id },
      });
      console.log("Это файл Скачать: ", file.dataValues);
      const pathFile = path.join(
        __dirname,
        `../files/${req.user.id}/${file.dataValues.path}`
      );

      if (fs.existsSync(pathFile)) {
        return res.download(pathFile, file.dataValues.name);
      }
      return res.status(400).json({ message: "Download error" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Download error" });
    }
  }

  async deleteFile(req, res) {
    try {
      const file = await File.findOne({
        where: { id: req.query.id, user: req.user.id },
      });
      const user = await User.findByPk(req.user.id);
      const parent = await File.findByPk(file.dataValues.parent);
      if (file.dataValues.type == "dir") {
        let fullPath = path.join(
          __dirname,
          `../files/${user.dataValues.id}/${file.dataValues.path}`
        );

        fs.readdirSync(fullPath).forEach(async (file) => {
          const otherFiles = await File.destroy({ where: { name: file } });
        });
      }

      user.usedSpace = user.dataValues.usedSpace - file.dataValues.size;
      user.save();

      if (parent !== null) {
        (async () => {
          let fullPath = path.join(
            __dirname,
            `../files/${user.dataValues.id}/${parent.dataValues.path}`
          );

          const size = await dirSize(fullPath);
          await File.update(
            {
              size: size - file.dataValues.size,
            },
            { where: { name: parent.dataValues.name } }
          );
        })();
      }

      fileService.deleteFile(file);
      await file.destroy();
      if (!file) {
        return res.status(400).json({ message: "File not found" });
      }

      return res.json({
        user,
        message: "File was deleted",
      });
    } catch (e) {
      console.log(e);
    }
  }

  async searchFile(req, res) {
    try {
      const searchName = req.query.search;
      let files = await File.findAll({
        where: {
          user: req.user.id,
        },
      });
      files = files.filter((file) => file.name.includes(searchName));
      return res.json(files);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: "Search error" });
    }
  }

  async uploadAvatar(req, res) {
    try {
      console.log(req.files.file);
      const file = req.files.file;
      const user = await User.findByPk(req.user.id);
      const avatarName = Uuid.v4() + ".jpg";
      file.mv(path.join(__dirname, `../static/${avatarName}`));
      user.avatar = avatarName;
      await user.save();
      return res.json(user);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: "Upload avatar error" });
    }
  }

  async deleteAvatar(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      fs.unlinkSync(
        path.join(__dirname, `../static/${user.dataValues.avatar}`)
      );
      user.avatar = null;
      await user.save();
      return res.json(user);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: "Delete avatar error" });
    }
  }

  async choseFiles(req, res) {
    try {
      const file = await File.findByPk(req.body.id);
      console.log(file.chosen);
      await file.update({ chosen: !file.chosen });
      return res.json(file.dataValues);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: "Chose file error" });
    }
  }
  async setLastOpenDate(req, res) {
    try {
      const file = await File.findByPk(req.body.id);
      console.log(file.chosen);
      await file.update({ lastOpen: Date.now() });
      return res.json(file.dataValues);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: "Chose file error" });
    }
  }
}

module.exports = new FileController();
