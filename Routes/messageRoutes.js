const { Router } = require('express');
const router = Router();
const messageController = require('../Controllers/messageController');
const { userAuth } = require('../Filters/userAuth');

router.post('/add-message',userAuth, messageController.addMessage);

module.exports = router;