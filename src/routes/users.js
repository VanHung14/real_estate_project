const express = require('express')
const router = express.Router()

const usersController = require('../controllers/UsersController')


router.post('/login', usersController.login)
router.post('/refresh-token', usersController.refreshToken)
// router.get('/reset-password', usersController.linkResetPassword)
router.post('/reset-password-email', usersController.resetPasswordEmail)
router.put('/update-password', usersController.updatePassword)
router.post('/', usersController.register)


module.exports = router
