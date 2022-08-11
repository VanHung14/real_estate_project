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
      res.status(variable.BadRequest).send(err);
    }
  }

  // [GET] /posts/:id/images
  async getImagePathsByPostId(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let imgPaths = await prisma.images.findMany({ where: { post_id: id } });
      let list = [];
      if (JSON.stringify(imgPaths) != JSON.stringify([])) {
        for (var i = 0; i < imgPaths.length; ++i) {
          let separate = imgPaths[i].image_path.split("\\");

          list.push(separate[separate.length - 1]);
          // console.log(imgPaths[i].image_path)
        }
        res.send(list);
      } else {
        res.status(404).send("No images found!");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }

  // [GET]/posts/:id
  async getPostById(req, res, next) {
    try {
      let id = parseInt(req.params.id);
      let post = await prisma.posts.findFirst({ where: { id: id } });
      if (post) {
        post.image_path_list = [];
        let address = await prisma.address.findFirst({
          where: { id: post.id },
        });
        post.address = address;
        let images = await prisma.images.findMany({
          where: { post_id: post.id },
        });
        for (var i = 0; i < images.length; ++i) {
          console.log(images[i].image_path);
          post.image_path_list.push(images[i].image_path);
        }
        res.send(post);
      } else {
        res.status(204).send("No post found!");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }

  // [POST] api/posts/
  async createPost(req, res, next) {
    try {
      if (req.user.role_id == 2) {
        let address = await prisma.address.findFirst({
          where: {
            city: req.body.city,
            district: req.body.district,
            ward: req.body.ward,
            street: req.body.street,
          },
        });
        if (address) {
          deleteImgInByReqFiles(req.files);
          res.status(401).send("Address is already created!");
        } else {
          let date = new Date();
          date.setHours(date.getHours() + 7);
          let post = await prisma.posts.create({
            data: {
              title: req.body.title,
              content: req.body.content,
              price: parseFloat(req.body.price),
              phone: req.body.phone,
              status: req.body.status,
              created_at: date,
              updated_at: date,
              user_id: req.user.id,
              address: {
                create: {
                  city: req.body.city,
                  district: req.body.district,
                  ward: req.body.ward,
                  street: req.body.street,
                },
              },
            },
          });

          if (post) {
            var array = req.files;
            for (var i = 0; i < array.length; ++i) {
              array[i] = {
                image_path: array[i].path,
                post_id: post.id,
              };
            }
            let image = await prisma.images.createMany({
              data: array,
            });

            res.send(post);
          } else {
            deleteImgInByReqFiles(req.files);
            res.status(400).send("Post failed!");
          }
        }
      } else {
        deleteImgInByReqFiles(req.files);
        res
          .status(403)
          .send("No permission! Create post only works for seller.");
      }
    } catch (err) {
      deleteImgInByReqFiles(req.files);
      res.status(400).send(err);
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

      let date = new Date();
      date.setHours(date.getHours() + 7);
      let checkPost = await prisma.posts.findFirst({ where: { id: id } });
      if (checkPost) {
        if (req.user.role_id == 1 || req.user.id == checkPost.user_id) {
          // check if post is available
          if (
            checkPost.created_at.getTime() != checkPost.updated_at.getTime()
          ) {
            // check if this post had been changed before?
            // if(false){
            // delete files in local folder when not update new images
            deleteImgInByReqFiles(req.files);
            res.status(400).send("This post had been changed before.");
          } else {
            let post = await prisma.posts.update({
              where: {
                id: id,
              },
              data: {
                title: title,
                content: content,
                price: price,
                phone: phone,
                status: status,
                updated_at: date,
              },
            });
            if (post) {
              // delete image in local folder
              let imgPaths = [];
              // console.log(typeof(req.body.delList) == 'object')
              if (req.body.delList != undefined && req.body.delList != "") {
                if (typeof req.body.delList == "object") {
                  // console.log('1', req.body.delList)
                  for (var i = 0; i < req.body.delList.length; ++i) {
                    imgPaths[i] =
                      "src\\public\\post_img\\" + req.body.delList[i];
                  }
                } else if (req.body.delList.includes(",")) {
                  // console.log('2', req.body.delList)
                  imgPaths = req.body.delList.split(",");
                  for (var i = 0; i < imgPaths.length; ++i) {
                    imgPaths[i] = "src\\public\\post_img\\" + imgPaths[i];
                  }
                } else if (req.body.delList.length > 0) {
                  // console.log('3', req.body.delList)
                  imgPaths.push("src\\public\\post_img\\" + req.body.delList);
                }
              }

              // console.log(imgPaths)

              if (JSON.stringify(imgPaths) != JSON.stringify([])) {
                deleteImgInByPath(imgPaths);
              }
              // delete record in DB

              let deleteImg = await prisma.images.deleteMany({
                where: { image_path: { in: imgPaths } },
              });

              var array = req.files;

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
                  city: city,
                  district: district,
                  ward: ward,
                  street: street,
                },
              });
              res.send(post);
            } else {
              deleteImgInByReqFiles(req.files);
              res.status(400).send("Update failed!");
            }
          }
        } else {
          deleteImgInByReqFiles(req.files);
          res.status(403).send("No permisstion!");
        }
      } else {
        deleteImgInByReqFiles(req.files);
        res.status(404).send("No posts found!");
      }
    } catch (err) {
      deleteImgInByReqFiles(req.files);
      res.status(400).send(err);
    }
  }

  // [DELETE] /api/posts/:id
  // Only works with user who own this post, or admin.
  async deletePost(req, res, next) {
    try {
      var id = parseInt(req.params.id);
      let post = await prisma.posts.findFirst({ where: { id: id } });
      if (post) {
        if (req.user.id == 1 || post.user_id == req.user.id) {
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
          if (delPost) {
            deleteImgInByPath(delList);
            res.send(delPost);
          } else {
            res.status(404).send("Delete failed!");
          }
        } else {
          res
            .status(403)
            .send(
              "No permission! Only works with user who own this post, or admin."
            );
        }
      } else {
        res.status(404).send(" No posts found!");
      }
    } catch (err) {
      res.status(400).send(err);
    }
  }
}

module.exports = new PostsController();

async function deleteImgInByReqFiles(array) {
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

async function deleteImgInByPath(array) {
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
