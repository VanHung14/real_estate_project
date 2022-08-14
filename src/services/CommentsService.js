const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const variable = require("../configs/variable");
const fs = require("fs");

exports.createComment = async function (data) {
  try {
    let comment = await prisma.comments.create({ data });
    if (!comment) return variable.BadRequest;
    return comment;
  } catch (err) {
    throw err;
  }
};

exports.updateComment = async function (id, data, user_id) {
  try {
    let comment = await prisma.comments.findFirst({ where: { id: id } });
    if (!comment) return variable.NoContent;
    if (user_id != comment.user_id) return variable.Forbidden;
    let updateCmt = await prisma.comments.update({
      where: { id: id },
      data,
    });
    if (!updateCmt) return variable.BadRequest;
    return updateCmt;
  } catch (err) {
    throw err;
  }
};

exports.getComment = async function (data) {
  try {
    let comments = await prisma.comments.findMany(data);
    if (JSON.stringify(comments) == JSON.stringify([]))
      return variable.NoContent;
    return comments;
  } catch (err) {
    throw err;
  }
};

exports.deleteComment = async function (id, user_id, role_id) {
  try {
    let comment = await prisma.comments.findFirst({ where: { id: id } });
    if (!comment) return variable.NoContent;
    if (user_id != comment.user_id && role_id != 1) return variable.Forbidden;
    let delCmt = await prisma.$transaction([
      prisma.comments.delete({ where: { id: id } }),
    ]);
    if (!delCmt) return variable.BadRequest;
    return delCmt;
  } catch (err) {
    throw err;
  }
};
