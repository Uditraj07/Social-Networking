
const { getUserId, setUserId } = require('../Middleware/auth');
 
const Follow = require('../Models/followersModel');
const User = require('../Models/userModel');

exports.addFollowers = async(req, res, next) => {
   try {
        const token = req.cookies.user_id;
        const userId = getUserId(token);
       const username = req.headers['username'];
       console.log(username)
        const follower = await User.findOne({ where: { username: username } });

    if (!follower) {
      return res.status(404).json({ error: 'User not found' });
       }
       const followerId = follower.id;
       let response=await Follow.create({
      user_id: userId,
      follower_id: followerId
       });
       
       if (response) {
           res.status(201).json({ message: true });
       }
    
   } catch (error) {
       console.log(error);
       res.status(500).json({ error: 'Internal server error' });
   }
}

exports.removeFollowers = async(req, res, next) => {
   try {
        const token = req.cookies.user_id;
        const userId = getUserId(token);
       const username = req.headers['username'];
        const follower = await User.findOne({ where: { username: username } });

    if (!follower) {
      return res.status(404).json({ error: 'User not found' });
       }
       const followerId = follower.id;
       let response = await Follow.destroy({
            where: {
                user_id: userId,
                follower_id: followerId
            }
       });
        if (response) {
        res.status(200).json({ message: true }); // Use 200 for successful deletion
        }
    
   } catch (error) {
       console.log(error);
       res.status(500).json({ error: 'Internal server error' });
   }
}