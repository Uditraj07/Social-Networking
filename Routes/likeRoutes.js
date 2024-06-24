
const { Router } = require('express');
const router = Router();
const likeController = require('../Controllers/likeController');


const { userAuth, userNoauth } = require('../Filters/userAuth');

router.post('/add-like', userAuth, likeController.add_like);
router.post('/remove-like', userAuth, likeController.remove_like);


module.exports = router;