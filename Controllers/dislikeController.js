const { getUserId, setUserId } = require('../Middleware/auth');
const dislikeModel = require('../Models/dislikeModel');

exports.add_dislike = async (req, res, next) => {
    try {
        const token = req.cookies.user_id;
        const userId = getUserId(token);
        const BlogId = req.headers['postid'];

        let dislike_details = { UserId: userId, BlogId: BlogId };
        let response = await dislikeModel.create(dislike_details);
        if (response) {
            res.json({ message: true });
        }
    } catch (error) {
        console.log(error);
    }  
}

exports.remove_dislike = async (req, res, next) => {
    try {
        const token = req.cookies.user_id;
        const userId = getUserId(token);
        const BlogId = req.headers['postid'];
        let response = await dislikeModel.destroy({
            where: {
                UserId: userId,
                BlogId:BlogId
        }});
        if (response) {
            res.json({ message: true });
        }
    } catch (error) {
        console.log(error);
    }  
}