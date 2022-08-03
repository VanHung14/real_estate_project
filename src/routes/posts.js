const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')



const postsController = require('../controllers/PostsController')

var uploadFile = upload.array('images', 10);

router.post('/', [uploadFile, auth] , postsController.createPost)
router.get('/', auth , postsController.getPosts)
router.get('/:id', auth , postsController.getPostById)
router.patch('/:id',[uploadFile, auth], postsController.updatePost)
router.delete('/:id', auth , postsController.deletePost)


module.exports = router
