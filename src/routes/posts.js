const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

const postsController = require('../controllers/PostsController')

router.post('/create', auth , postsController.create)

module.exports = router
