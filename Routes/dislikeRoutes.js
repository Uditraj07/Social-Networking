const { Router } = require('express');
const router = Router();
const dislikeController = require('../Controllers/dislikeController');


const { userAuth, userNoauth } = require('../Filters/userAuth');

router.post('/add-dislike', userAuth, dislikeController.add_dislike);
router.post('/remove-dislike', userAuth, dislikeController.remove_dislike);


module.exports = router;