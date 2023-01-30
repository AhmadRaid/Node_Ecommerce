const express = require('express')
const router = express.Router()
const {indexUser, storeUser, showUser, updateUser, deleteUser} = require('../controllers/userController')
const {protectAuth} = require('../controllers/authController')


router.route('/').get(indexUser).post(storeUser)
router.route('/user/:id').get(showUser).patch(updateUser).delete(deleteUser)


module.exports = router