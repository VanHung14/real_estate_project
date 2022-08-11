const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const variable = require("../configs/variable");

exports.getPostsNoFilter = async function (page, perPage) {
  try {
    let posts = await prisma.posts.findMany({
      skip: perPage * page - perPage,
      take: perPage,
    });
    if (!posts) return variable.NotFound;
    for (var i = 0; i < posts.length; ++i) {
      let address = await prisma.address.findFirst({
        where: { id: posts[i].id },
      });
      posts[i].address = address;
      let image = await prisma.images.findFirst({
        where: { post_id: posts[i].id },
      });
      if (image != null) {
        posts[i].first_image_path = image.image_path;
      }
    }
    return posts;
  } catch (err) {
    throw err;
  }
};

exports.getPostsByFilter = async function (
  page,
  perPage,
  sortKey,
  sortDirect,
  filter,
  min,
  max,
  city,
  district,
  ward,
  street,
  search
) {
  try {
    let sort = {};
    sort[sortKey] = sortDirect;
    let posts = [];
    if (filter == "price") {
      posts = await prisma.posts.findMany({
        skip: perPage * page - perPage,
        take: perPage,
        where: {
          AND: [
            {
              OR: [
                { title: { contains: search } },
                { content: { contains: search } },
              ],
            },
            { price: { lte: max, gte: min } },
          ],
        },
        orderBy: [sort],
      });
    } else {
      let address = await prisma.address.findMany({
        skip: perPage * page - perPage,
        take: perPage,
        where: {
          city: { contains: city },
          district: { contains: district },
          ward: { contains: ward },
          street: { contains: street },
        },
      });
      let idList = [];
      for (var i = 0; i < address.length; ++i) {
        idList.push(address[i].id);
      }
      posts = await prisma.posts.findMany({
        where: {
          AND: [
            { id: { in: idList } },
            {
              OR: [
                { title: { contains: search } },
                { content: { contains: search } },
              ],
            },
          ],
        },
        orderBy: [sort],
      });
    }
    if (JSON.stringify(posts) == JSON.stringify([])) return variable.NoContent;
    for (var i = 0; i < posts.length; ++i) {
      let address = await prisma.address.findFirst({
        where: { id: posts[i].id },
      });
      posts[i].address = address;
      let image = await prisma.images.findFirst({
        where: { post_id: posts[i].id },
      });
      if (image != null) {
        posts[i].first_image_path = image.image_path;
      }
    }
    return posts;
  } catch (err) {
    throw err;
  }
};
