const { getUserId, setUserId } = require('../Middleware/auth');
const likeModel = require('../Models/likeModels');

exports.add_like = async (req, res, next) => {
    try {
        const token = req.cookies.user_id;
        const userId = getUserId(token);
        const BlogId = req.headers['postid'];

        let like_details = { UserId: userId, BlogId: BlogId };
        let response = await likeModel.create(like_details);
        if (response) {
            res.json({ message: true });
        }
    } catch (error) {
        console.log(error);
    }  
}

exports.remove_like = async (req, res, next) => {
    try {
        const token = req.cookies.user_id;
        const userId = getUserId(token);
        const BlogId = req.headers['postid'];
        let response = await likeModel.destroy({
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