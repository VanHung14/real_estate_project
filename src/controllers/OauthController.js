const { PrismaClient } = require("@prisma/client");
const variable = require("../configs/variable");
const prisma = new PrismaClient();
const usersController = require("../controllers/UsersController");

const utils = require("../utils/utils");

class OauthController {
  // [GET] /api/auth/email
  async authen(req, res) {
    try {
      req.role_id = req.params.id;
      res.redirect(utils.request_get_auth_code_url);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
  // [GET] /api/allback
  async loginByOAuth(req, res) {
    const authorization_token = req.query;
    console.log(req.query);
    try {
      const response = await utils.get_access_token(authorization_token.code);
      const { access_token } = response.data;
      const user = await utils.get_profile_data(access_token);
      let isAvailableUser = await prisma.users.findFirst({
        where: { email: user.data.email },
      });
      if (isAvailableUser) return res.send(isAvailableUser);
      let data = {
        full_name: user.data.name,
        email: user.data.email,
        role_id: variable.NonRoleId,
      };
      await usersController.register({ body: data }, res);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
}

module.exports = new OauthController();
