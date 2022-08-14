const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const variable = require("../configs/variable");
const fs = require("fs");

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

exports.getImageNamesByPostId = async function (id) {
  try {
    let imgPaths = await prisma.images.findMany({ where: { post_id: id } });
    let list = [];
    if (JSON.stringify(imgPaths) == JSON.stringify([]))
      return variable.NoContent;
    for (var i = 0; i < imgPaths.length; ++i) {
      let separate = imgPaths[i].image_path.split("\\");
      list.push(separate[separate.length - 1]);
    }
    return list;
  } catch (err) {
    throw err;
  }
};

exports.getPostById = async function (id) {
  try {
    let post = await prisma.posts.findFirst({ where: { id: id } });
    if (!post) return variable.NoContent;
    post.image_path_list = [];
    let address = await prisma.address.findFirst({
      where: { id: post.id },
    });
    post.address = address;
    let images = await prisma.images.findMany({
      where: { post_id: post.id },
    });
    for (var i = 0; i < images.length; ++i) {
      post.image_path_list.push(images[i].image_path);
    }
    return post;
  } catch (err) {
    throw err;
  }
};

exports.createPost = async function (
  city,
  district,
  ward,
  street,
  title,
  content,
  price,
  phone,
  status,
  user_id,
  files
) {
  try {
    let address = await prisma.address.findFirst({
      where: {
        city: city,
        district: district,
        ward: ward,
        street: street,
      },
    });
    if (address) {
      return variable.ResetContent;
    } else {
      let date = new Date();
      date.setHours(date.getHours() + 7);
      let post = await prisma.posts.create({
        data: {
          title: title,
          content: content,
          price: parseFloat(price),
          phone: phone,
          status: status,
          created_at: date,
          updated_at: date,
          user_id: user_id,
          address: {
            create: {
              city: city,
              district: district,
              ward: ward,
              street: street,
            },
          },
        },
      });
      console.log(!post);
      if (!post) return variable.BadRequest;
      var array = files;
      for (var i = 0; i < array.length; ++i) {
        array[i] = {
          image_path: array[i].path,
          post_id: post.id,
        };
      }
      let image = await prisma.images.createMany({
        data: array,
      });
      return post;
    }
  } catch (err) {
    throw err;
  }
};

exports.updatePost = async function (id, data, delList, files) {
  try {
    let isValidPost = await prisma.posts.findFirst({ where: { id: id } });
    if (!isValidPost) return variable.NoContent;
    if (isValidPost.created_at.getTime() != isValidPost.updated_at.getTime())
      // if (false)
      return variable.ResetContent;
    let post = await prisma.posts.update({
      where: { id: id },
      data,
    });
    if (!post) return variable.BadRequest;
    // delete image in local folder
    let imgPaths = [];
    if (delList != undefined && delList != "") {
      if (typeof delList == "object") {
        for (var i = 0; i < delList.length; ++i) {
          imgPaths[i] = "src\\public\\post_img\\" + delList[i];
        }
      } else if (delList.includes(",")) {
        imgPaths = delList.split(",");
        for (var i = 0; i < imgPaths.length; ++i) {
          imgPaths[i] = "src\\public\\post_img\\" + imgPaths[i];
        }
      } else if (delList.length > 0) {
        imgPaths.push("src\\public\\post_img\\" + delList);
      }
    }
    if (JSON.stringify(imgPaths) != JSON.stringify([])) {
      deleteImgByPath(imgPaths);
    }
    let deleteImg = await prisma.images.deleteMany({
      where: { image_path: { in: imgPaths } },
    });
    var array = files;
    for (var i = 0; i < array.length; ++i) {
      array[i] = {
        image_path: array[i].path,
        post_id: post.id,
      };
    }
    let image = await prisma.images.createMany({
      data: array,
    });
    let address = await prisma.address.update({
      where: {
        id: post.id,
      },
      data: {
        city: data.city,
        district: data.district,
        ward: data.ward,
        street: data.street,
      },
    });
    return post;
  } catch (err) {
    throw err;
  }
};

exports.deletePost = async function (id) {
  try {
    let imgPath = await prisma.images.findMany({
      where: { post_id: id },
    });
    let delList = [];
    for (var i = 0; i < imgPath.length; ++i) {
      delList.push(imgPath[i].image_path);
    }
    let delPost = await prisma.posts.delete({
      where: {
        id: id,
      },
    });
    if (!delPost) return variable.NotFound;
    deleteImgByPath(delList);
    return delPost;
  } catch (err) {
    throw err;
  }
};

async function deleteImgByPath(array) {
  try {
    // delete files in local folder when not update new images
    if (array != undefined) {
      for (var i = 0; i < array.length; ++i) {
        fs.unlinkSync(array[i]);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
