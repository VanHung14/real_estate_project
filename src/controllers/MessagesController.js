const { PrismaClient } = require("@prisma/client");
const variable = require("../configs/variable");
const prisma = new PrismaClient();
const MessagesService = require("../services/MessagesService");
class MessagesController {
  // [POST] /api/messages/
  async createMessage(req, res, next) {
    try {
      let date = new Date();
      let receive_id = parseInt(req.body.receive_id);
      date.setHours(date.getHours() + 7);
      let data = {
        sender_id: req.user.id,
        receive_id: receive_id,
        message: req.body.message,
        created_at: date,
        updated_at: date,
      };
      let message = await MessagesService.createMessage(data);
      if (message == variable.BadRequest)
        return res.status(variable.BadRequest).send("Create message failed!");
      res.send(message);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [GET] /api/messages/
  async getAllMessages(req, res, next) {
    try {
      if (req.user.role_id != 1)
        return res.status(variable.Forbidden).send("No permission!");
      let perPage = 50;
      let page = parseInt(req.query.page) || 1;
      let data = {
        skip: perPage * page - perPage,
        take: perPage,
      };
      let messages = await MessagesService.getAllMessages(data);
      if (messages == variable.NoContent)
        return res.status(variable.NoContent).send();
      return res.send(messages);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [PATCH] /api/messages/:id
  async updateMessage(req, res, next) {
    try {
      let date = new Date();
      date.setHours(date.getHours() + 7);
      let id = parseInt(req.params.id);
      let message = req.body.message;
      let user_id = req.user.id;
      let data = {
        message: message,
        updated_at: date,
      };
      let update = await MessagesService.updateMessage(id, data, user_id);
      if (update == variable.NoContent)
        return res.status(variable.NoContent).send();
      if (update == variable.Forbidden)
        return res.status(variable.Forbidden).send("No permission!");
      if (update == variable.BadRequest)
        return res.status(variable.BadRequest).send("Update message failed!");
      res.send(update);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [GET] /api/messages/:id/chat
  async getConversationWithOther(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let perPage = 50;
      let page = parseInt(req.query.page) || 1;
      let data = {
        skip: perPage * page - perPage,
        take: perPage,
        where: {
          OR: [
            {
              sender_id: req.user.id,
              receive_id: id,
            },
            {
              sender_id: id,
              receive_id: req.user.id,
            },
          ],
        },
        orderBy: [{ created_at: "desc" }],
      };
      let getConver = await MessagesService.getConversationWithOther(data);
      if (getConver == variable.NoContent)
        return res.status(variable.NoContent).send();
      res.send(getConver);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [DELETE] /api/messages/:id
  async deleteMessage(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let user_id = req.user.id;
      let user_role_id = req.user.role_id;
      let delMess = await MessagesService.deleteMessage(
        id,
        user_id,
        user_role_id
      );
      if (delMess == variable.NoContent)
        return res.status(variable.NoContent).send();
      if (delMess == variable.Forbidden)
        return res.status(variable.Forbidden).send("No permission!");
      if (delMess == variable.BadRequest)
        return res.status(variable.BadRequest).send("Delete failed!");
      res.send(delMess);
    } catch (err) {
      res.status(400).send(err);
    }
  }
}

module.exports = new MessagesController();
