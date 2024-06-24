const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const {setUserId,getUserId}=require('../Middleware/auth');
const User = require('../Models/userModel');
const Blog = require('../Models/blogModel');
const Follow = require('../Models/followersModel')
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
                res.cookie('user_id',token);
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

exports.userDetails = async(req, res, next) => {
    try {
        const uname = req.query.username;
        const token = req.cookies.user_id;
        const userId = getUserId(token);
  
        const userDetails = await User.findOne({
            attributes: {
                    exclude: [''] 
                },
            where: { username: uname },
            include: [{
                model: Blog,
                attributes: {
                    exclude: ['UserId'] // Exclude userId from Blog attributes
                }
            }]
        });

        const isFollowing = await Follow.findOne({
        where: {
            user_id: userId,
            follower_id: userDetails.id // Assuming you need to access ID here
        }
        });
        
        const totalFollowers = await Follow.count({
            where: { follower_id: userDetails.id }
            });

        const totalFollowing = await Follow.count({
            where: { user_id: userDetails.id }
            });

    res.render('profile_details', { cookies: req.cookies,userDetails:userDetails,isFollowing: !!isFollowing ,totalFollowers: totalFollowers,
      totalFollowing: totalFollowing });
    } catch (error) {
        console.log(error);
    }    
}


function crypt_password(password, salt) {
    return bcrypt.hash(password, parseInt(salt));
}

function compare_password(userInputPassword, storedHashedPassword) {
    return bcrypt.compare(userInputPassword, storedHashedPassword);
}



