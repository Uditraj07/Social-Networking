const { serUserId, getUserId } = require('../Middleware/auth');
const User = require('../Models/userModel');
const Message = require('../Models/messageModel');
const { Op } = require('sequelize');

exports.addMessage = async (req, res, next) => {
   try {
       let message = req.body;
        const token = req.cookies.user_id;
        const userId = getUserId(token);
       const Receiver = await User.findOne({
           where: {
               username: message.username
           }
       });
       let message_details = { sender_id: userId, receiver_id: Receiver.dataValues.id, content: message.content };
       let response = await Message.create(message_details);
       if (response) {
           res.json({message:true})
       }
       else {
           res.send("Internal Server issues please try after sometime");
       }
       
   } catch (error) {
       console.log(error);
   }

}

exports.allMessages = async (req, res, next) => {
    try {

        const uname = req.headers['username'];
        const token = req.cookies.user_id;
        const userId = getUserId(token);

        const userDetails = await User.findOne({
            where: { username: uname },
        });
        let receiverId = userDetails.dataValues.id;

        const all_messages = await Message.findAll({
                where: {
                    [Op.or]: [
                        {
                            sender_id: userId,
                            receiver_id: receiverId
                        },
                        {
                            sender_id: receiverId,
                            receiver_id: userId
                        }
                    ]
                },
                include: [
                    { model: User, as: 'Sender', attributes: ['username','fname','lname'] },
                    { model: User, as: 'Receiver', attributes: ['username'] }
                ],
            attributes: ['id', 'createdAt', 'content'],
            order: [['createdAt', 'ASC']]
        });

        res.json({ message: true, all_messages: all_messages });
    } catch (error) {
        console.log(error)
    }
}

exports.newMessage = async (req, res, next) => {
    try {
        const username = req.headers['username'];
        const createdAt = req.headers['createdat'];

        if (!username || !createdAt) {
            return res.status(400).json({ message: false, error: 'Missing headers' });
        }

        const userDetails = await User.findOne({
            where: { username: username },
        });

        if (!userDetails) {
            return res.status(404).json({ message: false, error: 'User not found' });
        }

        let receiverId = userDetails.dataValues.id;

        const newMessage = await Message.findOne({
            where: {
                sender_id: receiverId,
                createdAt: {
                    [Op.gt]: createdAt
                }
            },
            include: [
                { model: User, as: 'Sender', attributes: ['username','fname','lname'] },
                { model: User, as: 'Receiver', attributes: ['username'] }
            ],
            order: [['createdAt', 'ASC']],
            attributes: ['id', 'createdAt', 'content']
        });
        

        if (!newMessage) {
            return res.json({ message: true, new_message: null });
        }

        res.json({ message: true, new_message: newMessage });
    } catch (error) {
        console.error('Error fetching new message:', error);
        res.status(500).json({ message: false, error: 'Internal server error' });
    }
};