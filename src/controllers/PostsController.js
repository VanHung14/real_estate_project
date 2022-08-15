const { PrismaClient } = require("@prisma/client");
const config = require("../configs/config");
const jwt = require("jsonwebtoken");
const utils = require("../utils/utils");
const fs = require("fs");

const PostsService = require("../services/PostsService");
const variable = require("../configs/variable");

const prisma = new PrismaClient();

class PostsController {
  // [GET] /api/posts?sort=&direct=&filter=address&city=&district=&ward=
  async getPosts(req, res, next) {
    try {
      let page = parseInt(req.query.page) || 1;
      let perPage = 10;
      if (JSON.stringify(req.query) === JSON.stringify({})) {
        // get all posts by admin
        let posts = await PostsService.getPostsNoFilter(page, perPage);
        if (posts == variable.NotFound)
          return res.status(variable.NotFound).send("No posts found.");
        res.send(posts);
      } else {
        // sort with filter or search
        let sortKey = req.query.sort || "price";
        let sortDirect = req.query.direct || "desc";
        let filter = req.query.filter || "price";
        let city = req.query.city || "";
        let district = req.query.district || "";
        let ward = req.query.ward || "";
        let street = req.query.street || "";
        let search = req.query.search || "";
        let min = parseInt(req.query.min) || 0;
        let max = parseInt(req.query.max) || 100;
        let posts = await PostsService.getPostsByFilter(
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
        );
        if (posts == variable.NoContent)
          return res.status(variable.NoContent).send();
        res.send(posts);
      }
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [GET] /posts/:id/images
  async getImageNamesByPostId(req, res, next) {
    let id = parseInt(req.params.id);
    try {
      let imgPaths = await PostsService.getImageNamesByPostId(id);
      if (imgPaths == variable.NoContent)
        return res.status(variable.NoContent).send();
      res.send(imgPaths);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [GET]/posts/:id
  async getPostById(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let post = await PostsService.getPostById(id);
      if (post == variable.NoContent)
        return res.status(variable.NoContent).send();
      res.send(post);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [POST] api/posts/
  async createPost(req, res, next) {
    try {
      if (req.user.role_id != 2) {
        deleteImgByReqFiles(req.files);
        return res
          .status(403)
          .send("No permission! Create post only works for seller.");
      }
      let city = req.body.city;
      let district = req.body.district;
      let ward = req.body.ward;
      let street = req.body.street;
      let title = req.body.title;
      let content = req.body.content;
      let price = parseFloat(req.body.price);
      let phone = req.body.phone;
      let status = req.body.status;
      let user_id = req.user.id;
      let files = req.files;
      let post = await PostsService.createPost(
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
      );
      if (post == variable.ResetContent) {
        deleteImgByReqFiles(req.files);
        return res.status(variable.ResetContent).send();
      }
      if (post == variable.BadRequest) {
        deleteImgByReqFiles(req.files);
        return res.status(variable.BadRequest).send("Create post failed!");
      }
      res.send(post);
    } catch (err) {
      deleteImgByReqFiles(req.files);
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [PATCH] /api/:id/
  async updatePost(req, res, next) {
    try {
      let title = req.body.title || undefined;
      let content = req.body.content || undefined;
      let phone = req.body.phone || undefined;
      let status = req.body.status || undefined;
      let price = parseFloat(req.body.price) || undefined;
      let city = req.body.city || undefined;
      let district = req.body.district || undefined;
      let ward = req.body.ward || undefined;
      let street = req.body.street || undefined;
      let id = parseInt(req.params.id);
      let delList = req.body.delList;
      let user_id = req.user.id;
      let files = req.files;
      let post = await PostsService.getPostById(id);
      if (!post) {
        deleteImgByReqFiles(req.files);
        return res.status(variable.NoContent).send();
      }
      if (req.user.role_id != 1 && user_id != post.user_id) {
        deleteImgByReqFiles(req.files);
        return res.status(variable.Forbidden).send("No permisstion!");
      }
      let date = new Date();
      date.setHours(date.getHours() + 7);
      let data = {
        title: title,
        content: content,
        price: price,
        phone: phone,
        status: status,
        updated_at: date,
      };
      let addressData = {
        city: city,
        district: district,
        ward: ward,
        street: street,
      };
      let update = await PostsService.updatePost(
        id,
        data,
        addressData,
        delList,
        files
      );
      if (update == variable.NoContent) {
        deleteImgByReqFiles(req.files);
        return res.status(variable.NoContent).send();
      }
      if (update == variable.BadRequest) {
        deleteImgByReqFiles(req.files);
        return res.status(variable.BadRequest).send("Update failed!");
      }
      if (update == variable.ResetContent) {
        deleteImgByReqFiles(req.files);
        return res.status(variable.ResetContent).send("");
      }
      res.send(update);
    } catch (err) {
      deleteImgByReqFiles(req.files);
      res.status(variable.BadRequest).send(err.message);
    }
  }

  // [DELETE] /api/posts/:id
  async deletePost(req, res, next) {
    try {
      var id = parseInt(req.params.id);
      let post = await PostsService.getPostById(id);
      if (typeof post != "object") {
        return res.status(variable.NoContent).send();
      }
      if (req.user.role_id != 1 && req.user.id != post.user_id) {
        return res.status(variable.Forbidden).send("No permisstion!");
      }
      let delPost = await PostsService.deletePost(id);
      if (delPost == variable.NotFound)
        return res.status(variable.BadRequest).send("Delete failed!");
      res.send(delPost);
    } catch (err) {
      res.status(variable.BadRequest).send(err.message);
    }
  }
}

module.exports = new PostsController();

async function deleteImgByReqFiles(array) {
  // delete by req.files
  // console.log('array', array)
  try {
    // delete files in local folder when not update new images
    if (array != undefined) {
      for (var i = 0; i < array.length; ++i) {
        fs.unlinkSync(array[i].path);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteImgByPath(array) {
  // delete by path req.body
  // console.log('array', array)
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

async function deleteImgInByFileName(array) {
  // delete by path req.body
  // console.log('array', array)
  try {
    // delete files in local folder when not update new images
    if (array != undefined) {
      for (var i = 0; i < array.length; ++i) {
        fs.unlinkSync("src\\public\\post_img\\" + array[i]);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
