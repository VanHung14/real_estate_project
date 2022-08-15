const { PrismaClient } = require("@prisma/client");
const variable = require("../configs/variable");
const prisma = new PrismaClient();
const ReviewsService = require("../services/ReviewsService");

class ReviewsController {
  // [POST] /api/reviews/
  // Only works for buyer to review seller
  async createReview(req, res, next) {
    try {
      let seller_id = parseInt(req.body.seller_id);
      let rating = parseFloat(req.body.rating);
      let user_role_id = req.user.role_id;
      let date = new Date();
      date.setHours(date.getHours() + 7);
      let data = {
        seller_id: seller_id,
        buyer_id: req.user.id,
        review: req.body.review,
        rating: rating,
        created_at: date,
        updated_at: date,
      };
      let review = await ReviewsService.createReview(
        seller_id,
        user_role_id,
        data
      );
      if (review == variable.NoContent)
        return res.status(variable.NoContent).send();
      if (review == variable.Forbidden)
        return res.status(variable.Forbidden).send("No permission!");
      if (review == variable.BadRequest)
        return res.status(variable.BadRequest).send("Create review failed!");
      res.send(review);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [GET] /api/reviews/
  async getReviews(req, res, next) {
    try {
      let sellerId = parseInt(req.query.sellerId);
      let perPage = 50;
      let page = parseInt(req.query.page) || 1;
      let data = {
        skip: perPage * page - perPage,
        take: perPage,
      };
      let hasGetAllReviews = !Number.isInteger(sellerId);
      if (hasGetAllReviews) {
        if (req.user.role_id != 1)
          return res.status(variable.Forbidden).send("No permission!");
      } else {
        data["where"] = { seller_id: sellerId };
      }
      let reviews = await ReviewsService.getReviews(data);
      if (reviews == variable.NoContent)
        return res.status(variable.NoContent).send();
      res.send(reviews);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [PATCH] /api/reviews/:id
  async updateReview(req, res, next) {
    try {
      let date = new Date();
      date.setHours(date.getHours() + 7);
      let id = parseInt(req.params.id);
      let rating = parseFloat(req.body.rating);
      let user_id = req.user.id;
      let data = {
        review: req.body.review,
        updated_at: date,
        rating: rating,
      };
      let update = await ReviewsService.updateReview(id, data, user_id);
      if (update == variable.NoContent)
        return res.status(variable.NoContent).send();
      if (update == variable.Forbidden)
        return res.status(variable.Forbidden).send("No permission!");
      if (update == variable.BadRequest)
        return res.status(variable.BadRequest).send("Update failed!");
      res.send(update);
    } catch (err) {
      res.status(400).send(err);
    }
  }

  // [DELETE] /api/reviews/:id
  async deleteReview(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let user_id = req.user.id;
      let role_id = req.user.role_id;
      let review = await ReviewsService.deleteReview(id, user_id, role_id);
      if (review == variable.NoContent)
        return res.status(variable.NoContent).send();
      if (review == variable.Forbidden)
        return res.status(variable.Forbidden).send("No permission!");
      if (review == variable.BadRequest)
        return res.status(variable.BadRequest).send("review failed!");
      res.send(review);
    } catch (err) {
      res.status(400).send(err);
    }
  }
}

module.exports = new ReviewsController();
