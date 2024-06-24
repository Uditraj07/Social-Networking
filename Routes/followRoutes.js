

const { Router } = require('express');
const router = Router();
const followController = require('../Controllers/followController');

const { userAuth, userNoauth } = require('../Filters/userAuth');
const { Model } = require('sequelize');

router.post('/add-folllower', userAuth, followController.addFollowers);
router.post('/remove-folllower',userAuth,followController.removeFollowers);


module.exports = router;