const express = require('express')
const router = express.Router()

const usersController = require('../controllers/UsersController')

router.get('/reset-password', usersController.linkResetPassword)
router.post('/reset-password-email', usersController.resetPasswordEmail)
router.post('/reset-password', usersController.updatePassword)


module.exports = router
