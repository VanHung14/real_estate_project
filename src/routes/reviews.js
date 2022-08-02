const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router()

const reviewsController = require('../controllers/ReviewsController')

router.post('/', [auth] , reviewsController.createReview)
router.get('/', auth , reviewsController.getReviews)
router.patch('/:id',[ auth], reviewsController.updateReview)
router.delete('/:id', auth , reviewsController.deleteReview)



module.exports = router
