const blogModel = require('../Models/blogModel');
const User = require('../Models/userModel');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
 const {setUserId,getUserId}=require('../Middleware/auth');
const { where } = require('sequelize');
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

exports.delete_blog = async (req, res, next) => {
    let blog_id = req.headers['id'];
    console.log(blog_id);
    let blog_details = await blogModel.findOne({
        where: {
            id: blog_id,
        }
    });

    let imagePath = blog_details.dataValues.coverImage;

    let response=await blogModel.destroy({ where:{
        id:blog_id
        }
    })
    if (response) {
        if (imagePath) {
            let fullImagePath = path.join(__dirname, '..','public', 'uploads', imagePath);
            fs.unlink(fullImagePath, (err) => {
                if (err) {
                    console.error('Error deleting image:', err);
                } else {
                    console.log('Image deleted successfully');
                }
            });
        }
        return res.json({ message: true });
    }
}