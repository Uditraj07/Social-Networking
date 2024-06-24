const { setUserId,getUserId } = require('../Middleware/auth');
const User = require('../Models/userModel');

const userAuth = async (req, res, next) => {
    try {
        const userId = req.cookies?.user_id;
        if (!userId) {
            return res.redirect('/user/login');
        }
        
        const user = getUserId(userId);
        if (!user) {
            return res.redirect('/user/login');
        }
        
        const user_info = await User.findOne({
            where: { id: user }
        });

        if (!user_info) {
            res.clearCookie("user_id");
            return res.redirect('/user/login');
        }
        next();
    } catch (error) {
        console.error(error);
        return res.redirect('/user/login');
    }
}

const userNoauth = (req, res, next) => {
    const userId = req.cookies?.user_id;
    if (!userId) {
        next();
    } else {
        return res.redirect('/');
    }
}

module.exports = {
    userAuth,
    userNoauth
}