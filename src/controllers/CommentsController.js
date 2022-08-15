const { PrismaClient } = require("@prisma/client");
const variable = require("../configs/variable");
const prisma = new PrismaClient();
const CommentsService = require("../services/CommentsService");

class CommentsController {
  // [POST] /api/comments/
  async createComment(req, res, next) {
    try {
      let postId = parseInt(req.body.post_id);
      let date = new Date();
      date.setHours(date.getHours() + 7);
      let data = {
        user_id: req.user.id,
        post_id: postId,
        comment: req.body.comment,
        created_at: date,
        updated_at: date,
      };
      let createCmt = await CommentsService.createComment(data);
      if (createCmt == variable.BadRequest)
        return res.status(variable.BadRequest).send("Create comment failed!");
      return res.send(createCmt);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [PATCH] /api/comments/:id
  async updateComment(req, res, next) {
    try {
      let date = new Date();
      date.setHours(date.getHours() + 7);
      let data = {
        comment: req.body.comment,
        updated_at: date,
      };
      let user_id = req.user.id;
      let id = parseInt(req.params.id);
      let updateCmt = await CommentsService.updateComment(id, data, user_id);
      if (updateCmt == variable.NoContent)
        return res.status(variable.NoContent).send();
      if (updateCmt == variable.BadRequest)
        return res.status(variable.BadRequest).send("Update failed!");
      if (updateCmt == variable.Forbidden)
        return res.status(variable.Forbidden).send("No permission!");
      return res.send(updateCmt);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [GET] /api/comments?page=&postId=
  async getComments(req, res, next) {
    try {
      let postId = parseInt(req.query.postId);
      let perPage = 50;
      let page = parseInt(req.query.page) || 1;
      let data = {
        skip: perPage * page - perPage,
        take: perPage,
      };
      let hasGetAllComments = !Number.isInteger(postId);
      if (hasGetAllComments) {
        if (req.user.role_id != 1)
          return res.status(403).send("No permission!");
      } else {
        data["where"] = { post_id: postId };
      }
      let comments = await CommentsService.getComments(data);
      if (comments == variable.NoContent)
        return res.status(variable.BadRequest).send("Get all comments failed!");
      res.send(comments);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [DELETE] /api/comments/:id
  async deleteComment(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let user_id = req.user.id;
      let role_id = req.user.role_id;
      let delCmt = await CommentsService.deleteComment(id, user_id, role_id);
      if (delCmt == variable.NoContent)
        return res.status(variable.NoContent).send();
      if (delCmt == variable.Forbidden)
        return res.status(variable.Forbidden).send("No permission!");
      if (delCmt == variable.BadRequest)
        return res.status(variable.BadRequest).send("Delete comment failed!");
      res.send(delCmt);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }
}
module.exports = new CommentsController();
