const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
class MessagesController {
  // [POST] /api/messages/
  async createMessage(req, res, next) {
    try {
      let date = new Date();
      let receive_id = parseInt(req.body.receive_id);
      date.setHours(date.getHours() + 7);
      let message = await prisma.messages.create({
        data: {
          sender_id: req.user.id,
          receive_id: receive_id,
          message: req.body.message,
          created_at: date,
          updated_at: date,
        },
      });
      if (message) {
        res.status(200).send(message);
      } else {
        res.status(400).send("message failed!");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }

  // [GET] /api/messages/
  // Only all messages works for admin
  async getMessages(req, res, next) {
    try {
      if (req.user.role_id == 1) {
        let perPage = 50;
        let page = parseInt(req.query.page) || 1;
        let messages = await prisma.messages.findMany({
          skip: perPage * page - perPage,
          take: perPage,
        });
        if (JSON.stringify(messages) != JSON.stringify([])) {
          res.send(messages);
        } else {
          res.status(204).send("No messages found!");
        }
      } else {
        res.status(403).send("No permission! Only admin can get comments.");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }

  // [PATCH] /api/messages/:id
  // Only works with users who own this message
  async updateMessage(req, res, next) {
    try {
      console.log(req.body);
      let date = new Date();
      date.setHours(date.getHours() + 7);
      let id = parseInt(req.params.id);
      let message = await prisma.messages.findFirst({ where: { id: id } });
      if (message) {
        if (req.user.id == message.sender_id) {
          let update = await prisma.messages.update({
            where: {
              id: id,
            },
            data: {
              message: req.body.message,
              updated_at: date,
            },
          });
          if (update) {
            res.send(update);
          } else {
            res.status(400).send("Update message failed!");
          }
        } else {
          res
            .status(403)
            .send("Not permission! Only works with users who own this message");
        }
      } else {
        res.status(204).send("No message found!");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }

  // [GET] /api/messages/:id/chat
  // Conversation between me and the user hasve this id.
  async getConversationToOther(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let perPage = 50;
      let page = parseInt(req.query.page) || 1;
      let conversation = await prisma.messages.findMany({
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
      });
      if (JSON.stringify(conversation) != JSON.stringify([])) {
        res.send(conversation);
      } else {
        res.status(204).send("No conversation found!");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }

  // [DELETE] /api/messages/:id
  // Only works with users who own this message, or admin
  async deleteMessage(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let message = await prisma.messages.findFirst({ where: { id: id } });
      if (message) {
        if (req.user.id == message.sender_id || req.user.role_id == 1) {
          let delMess = await prisma.messages.delete({ where: { id: id } });
          if (delMess) {
            res.send(delMess);
          } else {
            res.status(400).send("Delete message failed!");
          }
        } else {
          res
            .status(403)
            .send(
              "Not permission! Only works with users who own this message, or admin"
            );
        }
      } else {
        res.status(204).send("No messages found!");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }
}

module.exports = new MessagesController();
