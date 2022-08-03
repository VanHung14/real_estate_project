const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

const usersController = require('../controllers/UsersController')

/**
 * @swagger 
 * components:
 *   schemas:
 *     Users:
 *       type: object
 *       required:
 *          - id 
 *          - email
 *          - password
 *          - role_id
 *      properties:
 *         id:
 *           type: int
 *           description: Auto-increment
 *         full_name: 
 *           type: string
 *           description: Fullname
 *         email:
 *           type: string
 *           description: email unique
 *         password:
 *           type: string
 *           description: bcrypt
 *         phone:
 *           type: string
 *           description: phone-number
 *         created_at:
 *           type: date
 *           description: date
 *         updated_at:
 *           type: date
 *           description:date
 *         role_id:
 *           type: string
 *           description: role
 *         reset_password_token:
 *           type: string
 *           description: bcrypt
 *      example:
 *        id: 1
 *        full_name: Dinh Van Hung
 *        email: hungdv_tts@rikkeisoft.com
 *        password: $2b$10$SavipMUdy73XBudkhm.lwuFPCEHwWWcH.s7yWqcu7SL1h7Kn3Ne3.
 *        phone: 0935678376
 *        created_at: 2022-07-28 11:06:23.813
 *        updated_at: 2022-07-29 11:25:06.553
 *        role_id: 1
 *        reset_password_token: O5ER6qKkjCpbKHndKdah
 */

  
router.get('/:roleId/list', auth, usersController.getListUserByRoleId) // get user theo role
router.get('/:id', auth, usersController.getUserById)
router.patch('/:id', auth, usersController.updateUser)
router.delete('/:id', auth, usersController.deleteUser)
router.post('/login', usersController.login)
router.post('/refresh-token', usersController.refreshToken)
router.post('/forgot-password', usersController.forgotPassword)
router.put('/reset-password', usersController.resetPassword)
router.post('/', usersController.register)


module.exports = router
