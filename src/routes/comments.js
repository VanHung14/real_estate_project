const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const commentsController = require("../controllers/CommentsController");

router.post("/", [auth], commentsController.createComment);
router.get("/", auth, commentsController.getComments);
router.patch("/:id", [auth], commentsController.updateComment);
router.delete("/:id", auth, commentsController.deleteComment);

module.exports = router;
