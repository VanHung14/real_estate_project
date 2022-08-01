const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')

const postsController = require('../controllers/PostsController')

var uploadFile = upload.array('images', 10);

router.post('/', [uploadFile, auth] , postsController.create)
router.get('/', auth , postsController.getPosts)
router.get('/:id', auth , postsController.getPostById)
// router.put('/:id',[uploadFile, auth], postsController.updateNoDeleteOldImage)
// router.put('/:id/delImgs',[uploadFile, auth], postsController.updateDeleteOldImage)
router.put('/:id',[uploadFile, auth], postsController.updatePost)
router.delete('/:id',auth , postsController.deletePost)


module.exports = router
