const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

const usersController = require('../controllers/UsersController')

router.get('/:role/list', auth, usersController.getListUser) // get user theo role
router.get('/:id', auth, usersController.getUserById)
router.patch('/:id', auth, usersController.updateUser)
router.post('/login', usersController.login)
router.post('/refresh-token', usersController.refreshToken)
router.post('/forgot-password', usersController.forgotPassword)
router.put('/reset-password', usersController.resetPassword)
router.post('/', usersController.register)


module.exports = router
