const { Router } = require('express');
const router = Router();
const messageController = require('../Controllers/messageController');
const { userAuth } = require('../Filters/userAuth');

router.post('/add-message', userAuth, messageController.addMessage);
router.get('/get-all-messages', userAuth, messageController.allMessages);
router.get('/new-message', userAuth, messageController.newMessage);

module.exports = router;