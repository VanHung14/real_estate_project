const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const validator = require("email-validator");
const validatePhone = require("validate-phone-number-node-js");
const utils = require("../utils/utils");
const randtoken = require("rand-token");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const config = require("../configs/config");
const variable = require("../configs/variable");
const fs = require("fs");
const UsersService = require("../services/UsersService");
const Joi = require("joi");

class UsersController {
  // [GET] /api/users/:id
  async getUserById(req, res, next) {
    let id = parseInt(req.params.id);
    let user_id = req.user.id;
    let role_id_auth = req.user.role_id;
    try {
      if (role_id_auth != variable.AdminRoldId && user_id != id) {
        return res.status(403).send("No permission!");
      }
      let user = await UsersService.getUserById(id);
      if (!user) return res.status(variable.NoContent).send();
      res.send(user);
    } catch (err) {
      res.status(variable.BadRequest).send(err);
    }
  }

  // [GET] /api/users/:roleId/list
  async getListUserByRoleId(req, res, next) {
    let role_id = parseInt(req.params.roleId);
    let role_id_auth = req.user.role_id;
    try {
      if (role_id_auth != 1) {
        return res.status(403).send("No permission!");
      }
      let users = await UsersService.getListUserByRoleId(role_id);
      if (JSON.stringify(users) == JSON.stringify([]))
        return res.status(variable.NoContent).send();
      res.send(users);
    } catch (err) {
      res.status(variable.BadRequest).send(err);
    }
  }

  // [POST] /api/users
  async register(req, res) {
    const { error } = validateUser(req.body);
    if (error)
      return res.status(variable.BadRequest).send(error.details[0].message);
    try {
      const salt = await bcrypt.genSalt(10);
      const date = new Date();
      date.setHours(date.getHours() + 7);
      const data = {
        full_name: req.body.full_name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, salt),
        phone: req.body.phone,
        role_id: parseInt(req.body.role_id),
        created_at: date,
        updated_at: date,
      };
      let result = await UsersService.register(data);
      res.send(result);
    } catch (err) {
      res
        .status(variable.BadRequest)
        .send("This email or phone-number has already registered");
    }
  }

  // [POST]/api/users/login
  async login(req, res) {
    const { error } = validateLogin(req.body);
    if (error)
      return res.status(variable.BadRequest).send(error.details[0].message);
    try {
      let email = req.body.email;
      let password = req.body.password;
      let login = await UsersService.login(email, password);
      if (login == variable.UnAuthorized)
        return res
          .status(variable.UnAuthorized)
          .send("Invalid email or password.");
      res.send(login);
    } catch (err) {
      res.status(variable.BadRequest).send(err);
    }
  }

  // [POST]/api/users/refresh-token
  async refreshToken(req, res) {
    const refresh_token = req.body.refreshToken;
    try {
      let token = await UsersService.refreshToken(refresh_token);
      if (token == variable.UnAuthorized)
        return res.status(variable.UnAuthorized).send("Invalid refresh token!");
      res.send(token);
    } catch (err) {
      res.status(variable.BadRequest).send(err);
    }
  }

  // [PATCH] /api/users/:id
  async updateUser(req, res, next) {
    try {
      const salt = await bcrypt.genSalt(10);
      let full_name = req.body.full_name || undefined;
      let password;
      if (req.body.password) {
        password = await bcrypt.hash(req.body.password, salt);
      } else {
        password = undefined;
      }
      let phone = req.body.phone || undefined;
      let role_id = parseInt(req.body.role_id) || undefined;
      let id = parseInt(req.params.id);
      let user_id = req.user.id;
      let data = {};
      let date = new Date();
      date.setHours(date.getHours() + 7);
      data = {
        full_name: full_name,
        password: password,
        phone: phone,
        updated_at: date,
        role_id: role_id,
      };
      let role_id_auth = req.user.role_id;
      if (user_id != id && role_id_auth != variable.AdminRoldId)
        return res
          .status(variable.Forbidden)
          .send("No permission! Only works for myself, or admin");
      let update = await UsersService.updateUser(id, data);
      if (!update)
        return res.status(variable.BadRequest).send("Update failed!");
      res.send(update);
    } catch (err) {
      res.status(variable.BadRequest).send(err);
    }
  }

  // [DELETE] /api/users/:id
  async deleteUser(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let role_id_auth = req.user.role_id;
      if (role_id_auth != 1)
        return res
          .status(variable.BadRequest)
          .send("No permission! Only works for admin accounts");
      let delUser = await UsersService.deleteUser(id);
      if (delUser == variable.NotFound)
        return res.status(variable.NotFound).send("No user is deleted");
      res.send(delUser);
    } catch (err) {
      res.status(variable.BadRequest).send(err);
    }
  }

  // [POST] /api/users/forgot-password
  async forgotPassword(req, res, next) {
    try {
      var email = req.body.email;
      var phone = req.body.phone || "";
      let sendEmail = await UsersService.forgotPassword(email, phone);
      if (sendEmail == variable.NotFound)
        return res
          .status(variable.NotFound)
          .send("Invalid email or phone-number");
      if (sendEmail == variable.BadRequest)
        return res.send("Send email failed!");
      res.status(variable.OK).send("Send email successful!");
    } catch (err) {
      res.status(variable.BadRequest).send(err);
    }
  }

  //[put] /api/users/reset-password
  async resetPassword(req, res, next) {
    try {
      var token = req.body.resetPassToken;
      var password = req.body.password;
      let reset = await UsersService.resetPassword(token, password);
      if (reset == variable.BadRequest)
        return res.status(variable.BadRequest).send("Reset password failed!");
      res.send(reset);
    } catch (err) {
      res.status(variable.BadRequest).send(err);
    }
  }
}

module.exports = new UsersController();

async function deleteImgInByReqFiles(array) {
  try {
    // delete files in local folder when not update new images
    for (var i = 0; i < array.length; ++i) {
      fs.unlinkSync(array[i].path);
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteImgInByPath(array) {
  try {
    // delete files in local folder when not update new images
    for (var i = 0; i < array.length; ++i) {
      fs.unlinkSync(array[i]);
    }
  } catch (err) {
    console.error(err);
  }
}

function validateUser(user) {
  const schema = Joi.object({
    full_name: Joi.string(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    phone: Joi.string().min(10).max(11),
    role_id: Joi.number()
      .min(variable.MinRoleId)
      .max(variable.MaxRoleId)
      .required(),
    reset_password_token: Joi.string(),
  });
  return schema.validate(user);
}

function validateLogin(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });
  return schema.validate(user);
}
