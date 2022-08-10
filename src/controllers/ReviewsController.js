const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ReviewsController {
  // [POST] /api/reviews/
  // Only works for buyer to review seller
  async createReview(req, res, next) {
    try {
      let sellerId = parseInt(req.body.seller_id);
      let rating = parseFloat(req.body.rating);
      let seller = await prisma.users.findFirst({ where: { id: sellerId } });
      if (seller) {
        if (req.user.role_id == 3 && seller.role_id == 2) {
          let date = new Date();
          date.setHours(date.getHours() + 7);
          let review = await prisma.reviews.create({
            data: {
              seller_id: sellerId,
              buyer_id: req.user.id,
              review: req.body.review,
              rating: rating,
              created_at: date,
              updated_at: date,
            },
          });
          if (review) {
            res.send(review);
          } else {
            res.status(400).send("Create review failed!");
          }
        } else {
          res
            .status(403)
            .send("Not permission! Only works for buyer to review seller");
        }
      } else {
        res.status(404).send("No seller found!");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }

  // [GET] /api/reviews/
  // GET all reviews (have pagination)
  // Only works for admin
  async getReviews(req, res, next) {
    try {
      let sellerId = parseInt(req.query.sellerId);
      let perPage = 50;
      let page = parseInt(req.query.page) || 1;
      let data = {
        skip: perPage * page - perPage,
        take: perPage,
      };
      if (Number.isInteger(sellerId)) {
        data["where"] = { seller_id: sellerId };
      }
      // console.log('data', data)
      let reviews = await prisma.reviews.findMany(data);
      // console.log(reviews)
      if (Number.isInteger(sellerId)) {
        if (JSON.stringify(reviews) != JSON.stringify([])) {
          res.send(reviews);
        } else {
          res.status(204).send("No reviews found!");
        }
      } else {
        if (req.user.role_id == 1 && reviews) {
          res.send(reviews);
        } else {
          res.status(403).send("No permission! Only admin can get reviews.");
        }
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }

  // [PATCH] /api/reviews/:id
  // Only works with users who own this review
  async updateReview(req, res, next) {
    try {
      let date = new Date();
      date.setHours(date.getHours() + 7);
      let id = parseInt(req.params.id);
      let rating = parseFloat(req.body.rating);
      let review = await prisma.reviews.findFirst({ where: { id: id } });
      if (review) {
        if (req.user.id != review.buyer_id) {
          res
            .status(403)
            .send("Not permission! Only works with users who own this review");
        } else {
          let update = await prisma.reviews.update({
            where: {
              id: id,
            },
            data: {
              review: req.body.review,
              updated_at: date,
              rating: rating,
            },
          });
          if (update) {
            res.send(update);
          } else {
            res.status(400).send("Update review failed!");
          }
        }
      } else {
        res.status(204).send("No review found!");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }

  // [DELETE] /api/reviews/:id
  // Only works with users who own this review, or admin
  async deleteReview(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let review = await prisma.reviews.findFirst({ where: { id: id } });
      if (review) {
        if (req.user.id == review.buyer_id || req.user.role_id == 1) {
          let delCmt = await prisma.reviews.delete({ where: { id: id } });
          if (delCmt) {
            res.send(delCmt);
          } else {
            res.status(400).send("Delete review failed!");
          }
        } else {
          res
            .status(403)
            .send(
              "Not permission! Only works with users who own this review, or admin"
            );
        }
      } else {
        res.status(204).send("No reviews found!");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }
}

module.exports = new ReviewsController();
