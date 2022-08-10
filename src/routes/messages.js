const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const messagesController = require("../controllers/MessagesController");

router.post("/", [auth], messagesController.createMessage);
router.get("/", auth, messagesController.getMessages);
router.get("/:id/chat", auth, messagesController.getConversationToOther);
router.patch("/:id", [auth], messagesController.updateMessage);
router.delete("/:id", auth, messagesController.deleteMessage);

module.exports = router;
