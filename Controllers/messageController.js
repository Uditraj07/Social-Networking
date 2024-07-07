const { serUserId, getUserId } = require('../Middleware/auth');
const User = require('../Models/userModel');
const Message = require('../Models/messageModel');

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