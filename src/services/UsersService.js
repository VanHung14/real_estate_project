const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getUserById = async function (id, user_id, role_id) {
  try {
    if (role_id == 1 || user_id == id) {
      const user = await prisma.users.findFirst({ where: { id: id } });
      if (user) {
        return user;
      } else {
        throw 204;
      }
    } else {
      throw 403;
    }
  } catch (err) {
    throw err;
  }
};

exports.getListUserByRoleId = async function (role_id, role_id_auth) {
  try {
    if (role_id_auth == 1) {
      let seller = await prisma.users.findMany({ where: { role_id: role_id } });
      if (JSON.stringify(seller) != JSON.stringify([])) {
        return seller;
      } else {
        throw 404;
      }
    } else {
      throw 403;
    }
  } catch (err) {
    throw err;
  }
};

exports.updateUser = async function (id, data) {
  try {
    let update = await prisma.users.update({ where: { id: id }, data });
    return update;
  } catch (err) {
    throw Error(err);
  }
};
