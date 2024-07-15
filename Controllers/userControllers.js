const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const {setUserId,getUserId}=require('../Middleware/auth');
const User = require('../Models/userModel');
const Blog = require('../Models/blogModel');
const Follow = require('../Models/followersModel')
const Like = require('../Models/likeModels');
const DisLike = require('../Models/dislikeModel');
const Message = require('../Models/messageModel');
const Sequelize = require('sequelize');


const { Op } = require('sequelize');

dotenv.config();

exports.signin = async (req, res, next) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let user_info = await User.checkAlreadyRegistered(email, '', '');

        if (user_info) {
            let hashedPassword = user_info.dataValues.password;
            let response = await compare_password(password, hashedPassword);
            if (!response) {
                return res.render('login', { message: 'Invalid Credential' ,cookies: req.cookies});
            } else {
                let token = setUserId(user_info.dataValues.id);
                res.cookie('user_id', token);
                res.cookie('user_name',user_info.dataValues.username)
                return res.redirect('/')
            }
        } else {
            return res.render('login', { message: 'Invalid Credential',cookies: req.cookies });
        }

    } catch (error) {
        console.log(error);
        return res.render('login', { message: 'Internal server error, please try again later',cookies: req.cookies });
    }
}

exports.edit_profile = async (req, res, next)=>{
    
}

exports.register = async (req, res, next) => {
    try {
        const { fname, lname, username, email, gender, password, phone } = req.body;
        const existingUser = await User.checkAlreadyRegistered(email, phone, username);
        if (existingUser) {
            let message = '';
            if (existingUser.email === email) {
                message = 'Email is already registered';
            } else if (existingUser.phone === phone) {
                message = 'Phone number is already registered';
            } else if (existingUser.username === username) {
                message = 'Username is already registered';
            }
            return res.render('signup', { message, cookies: req.cookies });
        }

        const hashedPassword = await crypt_password(password, process.env.SALT);

        const userDetails = {
            fname, 
            lname,
            username,
            email,
            gender,
            phone,
            password: hashedPassword
        };

        const response = await User.create(userDetails);
        if (response) {
            return res.redirect('login');
        }
    } catch (error) {
        console.error(error);
        return res.render('register', { message: 'Internal server error, please try again later', cookies: req.cookies });
    }
};

exports.userDetails = async (req, res, next) => {
    try {
        const uname = req.query.username;
        const token = req.cookies.user_id;
        const userId = getUserId(token);

        const userDetails = await User.findOne({
            where: { username: uname },
            include: [{
                model: Blog,
                attributes: { exclude: ['UserId'] }
            }]
        });

        let receiverId = userDetails.id;
        

        if (!userDetails) {
            return res.status(404).render('profile_details', { message: 'User not found', cookies: req.cookies });
        }

        const isFollowing = await Follow.findOne({
            where: {
                user_id: userId,
                follower_id: userDetails.id
            }
        });

        const isSame = userDetails.id == userId;

        const totalFollowers = await Follow.findAll({
            where: { follower_id: userDetails.id },
            include: [{
                model: User,
                as: 'User', 
                attributes: [ 'fname', 'lname', 'username', 'email']
            }],
            attributes: {
                exclude: ['user_id', 'follower_id']
            }
        });

        const totalFollowing = await Follow.findAll({
            where: { user_id: userDetails.id },
            include: [{
                model: User,
                as: 'Follower',
                attributes: ['id', 'fname', 'lname', 'username', 'email']
            }],
            attributes: {
                exclude: ['user_id', 'follower_id']
            }
        });

        const currentUserFollowing = await Follow.findAll({
            where: { user_id: userId },
            include: [{
                model: User,
                as: 'Follower',
                attributes: ['fname', 'lname', 'username', 'email']
            }]
        });

       
        res.render('profile_details', {
            cookies: req.cookies,
            userDetails: userDetails,
            isFollowing: !!isFollowing,
            totalFollowers: totalFollowers,
            totalFollowing: totalFollowing,
            currentUserFollowing: currentUserFollowing,
            isSame: isSame,
        });

    } catch (error) {
        console.log(error);
        return res.render('profile_details', { message: 'Internal server error, please try again later', cookies: req.cookies });
    }
};

exports.dashboard = async (req, res, next) => {
    try {

        let token = req.cookies.user_id;
        let user_id = getUserId(token);
        
        const totalPosts = await Blog.count({ where: { UserId: user_id } });
        const totalFollowers = await Follow.count({ where: { follower_id: user_id } });
        const totalLikes = await Like.count({
                include: [{
                model: Blog,
                 where: { UserId: user_id }
            }]
        });
        const totalDisLikes = await DisLike.count({
            include: [{
                model: Blog,
                where: { UserId: user_id }
            }]
        });
        const chats =await Message.findAll({
            where: {
                [Op.or]: [
                    { sender_id: user_id },
                    { receiver_id: user_id }
                ]
            },
            attributes: [
                [Sequelize.literal('DISTINCT CASE WHEN sender_id != ' + user_id + ' THEN sender_id ELSE receiver_id END'), 'user_id']
            ],
            raw: true
        });
        const uniqueUserIds = chats.map(row => row.user_id);

        const chatUsers = await User.findAll({
            where: {
                id: {
                    [Op.in]: uniqueUserIds
                }
            },
            attributes: [ 'username', 'fname','lname','isLogin'] 
        });
       
        res.render('dashboard', {
            cookies: req.cookies,
            totalPosts,
            totalFollowers,
            totalLikes,
            totalDisLikes,
            chatUsers,
        });
        
    } catch (error) {
        console.log(error)
    }
}



function crypt_password(password, salt) {
    return bcrypt.hash(password, parseInt(salt));
}

function compare_password(userInputPassword, storedHashedPassword) {
    return bcrypt.compare(userInputPassword, storedHashedPassword);
}



