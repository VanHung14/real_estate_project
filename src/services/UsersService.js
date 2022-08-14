const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const variable = require("../configs/variable");
const config = require("../configs/config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const utils = require("../utils/utils");
const randtoken = require("rand-token");
const nodemailer = require("nodemailer");

exports.getUserById = async function (id) {
  try {
    const user = await prisma.users.findFirst({ where: { id: id } });
    return user;
  } catch (err) {
    throw err;
  }
};

exports.getListUserByRoleId = async function (role_id) {
  try {
    let users = await prisma.users.findMany({ where: { role_id: role_id } });
    return users;
  } catch (err) {
    throw err;
  }
};

exports.register = async function (data) {
  try {
    let user = await prisma.users.create({ data: data });
    return user;
  } catch (err) {
    throw err;
  }
};

exports.login = async function (email, password) {
  try {
    let isValidUser = await prisma.users.findFirst({
      where: { email: email },
    });
    if (!isValidUser) return variable.UnAuthorized;
    let isValidPassword = await bcrypt.compare(password, isValidUser.password);
    if (!isValidPassword) return variable.UnAuthorized;
    const token = jwt.sign(isValidUser, config.secret, {
      expiresIn: config.tokenLife,
    });
    const refreshToken = jwt.sign(isValidUser, config.refreshTokenSecret, {
      expiresIn: config.refreshTokenLife,
    });
    await prisma.tokens.create({
      data: {
        refresh_token: refreshToken,
      },
    });
    const response = { token, refreshToken };
    return response;
  } catch (err) {
    throw err;
  }
};

exports.refreshToken = async function (refresh_token) {
  try {
    let refreshToken = await prisma.tokens.findFirst({
      where: { refresh_token: refresh_token },
    });
    if (!refreshToken) return variable.UnAuthorized;
    const decodedRefreshToken = await utils.verifyJwtToken(
      refresh_token,
      config.refreshTokenSecret
    );
    let user = await prisma.users.findFirst({
      where: { id: decodedRefreshToken.id },
    });
    const token = jwt.sign(user, config.secret, {
      expiresIn: config.tokenLife,
    });
    return { token };
  } catch (err) {
    throw err;
  }
};
exports.updateUser = async function (id, data) {
  try {
    let update = await prisma.users.update({ where: { id: id }, data });
    return update;
  } catch (err) {
    throw err;
  }
};

exports.deleteUser = async function (id) {
  try {
    let posts = await prisma.posts.findMany({ where: { user_id: id } });
    let postIds = [];
    for (var i = 0; i < posts.length; ++i) {
      postIds = posts[i].id;
    }
    let imgPath = await prisma.images.findMany({
      where: { post_id: { in: postIds } },
    });
    let delList = [];
    for (var i = 0; i < imgPath.length; ++i) {
      delList.push(imgPath[i].image_path);
    }
    let delUser = await prisma.$transaction([
      prisma.users.delete({ where: { id: id } }),
    ]);
    if (!delUser) return variable.NotFound;
    if (JSON.stringify(delList) != JSON.stringify([])) {
      deleteImgInByPath(delList);
    }
    let delReview = await prisma.$transaction([
      prisma.reviews.deleteMany({
        where: { buyer_id: id },
      }),
    ]);
    let delMessage = await prisma.$transaction([
      prisma.messages.deleteMany({
        where: { OR: [{ sender_id: id }, { receive_id: id }] },
      }),
    ]);
    return delUser;
  } catch (err) {
    throw err;
  }
};

exports.forgotPassword = async function (email, phone) {
  try {
    let user = await prisma.users.findFirst({
      where: { email: email, phone: phone },
    });
    if (!user) return variable.NotFound;
    var token = randtoken.generate(20);
    var sent = await sendEmail(email, token);
    if (sent == false) return variable.BadRequest;
    var data = { reset_password_token: token };
    await prisma.users.update({ where: { email: email }, data });
    return variable.OK;
  } catch (err) {
    throw err;
  }
};

exports.resetPassword = async function (reset_password_token, password) {
  try {
    const salt = await bcrypt.genSalt(10);
    let user = await prisma.users.findFirst({
      where: { reset_password_token: reset_password_token },
    });
    if (!user) return variable.BadRequest;
    let date = new Date();
    date.setHours(date.getHours() + 7);
    let reset = await prisma.users.update({
      where: { email: user.email },
      data: {
        password: await bcrypt.hash(password, salt),
        updated_at: date,
      },
    });
    if (!reset) return variable.BadRequest;
    return reset;
  } catch (err) {
    throw err;
  }
};

async function sendEmail(email, token) {
  var email = email;
  var token = token;
  var mail = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: "dinhvanhung173@gmail.com",
      pass: "mpsiygqphyqtmbfo",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  var mailOptions = {
    from: "dinhvanhung173@gmail.com",
    to: email,
    subject: "Reset Password Link ",
    html:
      '<p>You requested for reset password, kindly use this <a href="http://localhost:3306/api/users/reset-password?token=' +
      token +
      '">link</a> to reset your password</p>',
  };
  return new Promise(function (resolve, reject) {
    mail.sendMail(mailOptions, function (error, info) {
      if (error) {
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
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
