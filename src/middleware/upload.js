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


module.exports = upload 