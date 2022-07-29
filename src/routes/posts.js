const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
var multer = require('multer')

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src\\public\\post_img')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-'+ file.originalname)
        // cb(null, file.fieldname + '-' + Date.now() + file.originalname.match(/\..*$/)[0])
    }
    
});

var upload = multer({ 
    storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") 
        {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg format allowed!')
            err.name = 'ExtensionError'
            return cb(err);
        }
    }, });  
var type = upload.array('images', 5);

const postsController = require('../controllers/PostsController')


router.post('/create', [type, auth] , postsController.create)
router.get('/', auth , postsController.all)
router.get('/sort', auth , postsController.sort)
router.get('/filter', auth , postsController.filter)
router.get('/detail/:id', auth , postsController.detailPost)
router.put('/updateNoDel/:id',[type, auth], postsController.updateNoDeleteOldImage)
router.put('/updateDelOldImg/:id',[type, auth], postsController.updateDeleteOldImage)

module.exports = router
