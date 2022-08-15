const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const variable = require("../configs/variable");

exports.createReview = async function (seller_id, user_role_id, data) {
  try {
    let seller = await prisma.users.findFirst({ where: { id: seller_id } });
    if (!seller) return variable.NoContent;
    if (user_role_id != 3 || seller.role_id != 2) return variable.Forbidden;
    let review = await prisma.reviews.create({ data });
    if (!review) return variable.BadRequest;
    return review;
  } catch (err) {
    throw err;
  }
};

exports.getReviews = async function (data) {
  try {
    let reviews = await prisma.reviews.findMany(data);
    if (JSON.stringify(reviews) == JSON.stringify([]))
      return variable.NoContent;
    return reviews;
  } catch (err) {
    throw err;
  }
};

exports.updateReview = async function (id, data, user_id) {
  try {
    let review = await prisma.reviews.findFirst({ where: { id: id } });
    if (!review) return variable.NoContent;
    if (user_id != review.buyer_id) return variable.Forbidden;
    let update = await prisma.reviews.update({
      where: { id: id },
      data,
    });
    if (!update) return variable.BadRequest;
    return update;
  } catch (err) {
    throw err;
  }
};

exports.deleteReview = async function (id, user_id, role_id) {
  try {
    let review = await prisma.reviews.findFirst({ where: { id: id } });
    if (!review) return variable.NoContent;
    if (user_id != review.buyer_id && role_id != 1) return variable.Forbidden;
    let delCmt = await prisma.$transaction([
      prisma.reviews.delete({ where: { id: id } }),
    ]);
    if (!delCmt) return variable.BadRequest;
    return delCmt;
  } catch (err) {
    throw err;
  }
};
