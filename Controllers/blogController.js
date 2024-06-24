const blogModel = require('../Models/blogModel');
const User = require('../Models/userModel');
const dotenv = require('dotenv');
 const {setUserId,getUserId}=require('../Middleware/auth');
dotenv.config();


exports.create_blog = async (req, res, next) => {
    try {
        let blog_title = req.body.title;
        let blog_body = req.body.body;
        let blog_img = req.file.filename;

        const token = req.cookies.user_id;
        const userId = getUserId(token);

        const blog_details = {
            title: blog_title,
            body: blog_body,
            coverImage: blog_img,
            UserId: userId
        };

        let response = await blogModel.create(blog_details);
        console.log(response);
        res.redirect('/blog');  
    } catch (error) {
        console.log(error);
        res.render('add_blog', { message: 'Internal server error, please try again later', cookies: req.cookies });
    }
};

exports.allBlog = async (req, res, next) => {
    try {
        const blogs = await blogModel.findAll({
            attributes: { exclude: ['UserId'] },
            include: [{
                model: User,
                attributes: ['username','UserId']  // Include only the username attribute from the User model
            }]
        });
        res.render('index', { cookies: req.cookies, blogs: blogs });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};