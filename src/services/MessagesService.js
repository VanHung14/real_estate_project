const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const variable = require("../configs/variable");

exports.createMessage = async function (data) {
  try {
    let message = await prisma.messages.create({ data });
    if (!message) return variable.BadRequest;
    return message;
  } catch (err) {
    throw err;
  }
};

exports.getAllMessages = async function (data) {
  try {
    let messages = await prisma.messages.findMany(data);
    if (JSON.stringify(messages) == JSON.stringify([]))
      return variable.NoContent;
    return messages;
  } catch (err) {
    throw err;
  }
};

exports.updateMessage = async function (id, data, user_id) {
  try {
    let message = await prisma.messages.findFirst({ where: { id: id } });
    if (!message) return variable.NoContent;
    if (user_id != message.sender_id) return variable.Forbidden;
    let update = await prisma.messages.update({
      where: { id: id },
      data,
    });
    if (!update) return variable.BadRequest;
    return update;
  } catch (err) {
    throw err;
  }
};

exports.getConversationWithOther = async function (data) {
  try {
    let conversation = await prisma.messages.findMany(data);
    if (JSON.stringify(conversation) == JSON.stringify([]))
      return variable.NoContent;
    return conversation;
  } catch (err) {
    throw err;
  }
};

exports.deleteMessage = async function (id, user_id, user_role_id) {
  try {
    let message = await prisma.messages.findFirst({ where: { id: id } });
    if (!message) return variable.NoContent;
    if (user_id != message.sender_id && user_role_id != 1)
      return variable.Forbidden;
    let delMess = await prisma.$transaction([
      prisma.messages.delete({ where: { id: id } }),
    ]);
    if (!delMess) return variable.BadRequest;
    return delMess;
  } catch (err) {
    throw err;
  }
};
