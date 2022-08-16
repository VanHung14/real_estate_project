const express = require("express");
const router = express.Router();

const oauthController = require("../controllers/OauthController");

router.get("/auth/email", oauthController.authen);
router.get("/callback", oauthController.loginByOAuth);

module.exports = router;
