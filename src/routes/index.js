const postsRouter = require("./posts");
const usersRouter = require("./users");
const commentsRouter = require("./comments");
const reviewsRouter = require("./reviews");
const messagesRouter = require("./messages");
const oauthRouter = require("./oauth");

function route(app) {
  app.use("/api/posts", postsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/comments", commentsRouter);
  app.use("/api/reviews", reviewsRouter);
  app.use("/api/messages", messagesRouter);
  app.use("/api", oauthRouter);
}

module.exports = route;
