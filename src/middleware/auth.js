const utils = require("../utils/utils");
const fs = require("fs");
const config = require("../configs/config");

module.exports = async function (req, res, next) {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (token) {
    try {
      const decoded = await utils.verifyJwtToken(token, config.secret);
      req.user = decoded;
      next();
    } catch (err) {
      if (req.files != undefined) {
        try {
          var array = req.files;
          for (var i = 0; i < array.length; ++i) {
            fs.unlinkSync(array[i].path);
          }
        } catch (err) {
          console.error(err);
        }
      }
      console.error(err);
      return res.status(401).json({
        message: "Unauthorized access.",
      });
    }
  } else {
    if (req.files != undefined) {
      try {
        var array = req.files;
        for (var i = 0; i < array.length; ++i) {
          fs.unlinkSync(array[i].path);
        }
      } catch (err) {
        console.error(err);
      }
    }
    return res.status(403).send({
      message: "No token provided.",
    });
  }
};
