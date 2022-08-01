const express = require('express')
const router = express.Router()

const usersController = require('../controllers/UsersController')


router.post('/login', usersController.login)
router.post('/refresh-token', usersController.refreshToken)
router.post('/forgot-password', usersController.forgotPassword)
router.put('/reset-password', usersController.resetPassword)
router.post('/', usersController.register)


module.exports = router
