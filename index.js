const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { getUserId, setUserId } = require('./Middleware/auth'); 
const sequelize = require('./utils/database');
const { Sequelize } = require('sequelize');

dotenv.config();
const app = express();

// Request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const userRoutes = require('./Routes/userRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const likeRoutes = require('./Routes/likeRoutes');
const dislikeRoutes = require('./Routes/dislikeRoutes');
const followRoutes = require('./Routes/followRoutes');
// Models
const User = require('./Models/userModel');
const Blog = require('./Models/blogModel');
const Like = require('./Models/likeModels');
const Dislike = require('./Models/dislikeModel');
const Follow = require('./Models/followersModel');

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    try {
        const blogs = await Blog.findAll({
        attributes: {
            exclude: ['UserId']
            },
            include: [{
                model: User,
                attributes: ['username', 'fname', 'lname']
            }]
        });
        const token = req.cookies.user_id;
        const likesByBlogId = await Like.findAll({
            attributes: ['BlogId', [Sequelize.fn('COUNT', Sequelize.col('like_id')), 'likeCount']],
            group: ['BlogId']
        });
        const dislikesByBlogId = await Dislike.findAll({
            attributes: ['BlogId', [Sequelize.fn('COUNT', Sequelize.col('dislike_id')), 'dislikeCount']],
            group: ['BlogId']
        });

        const likesMap = {};
            likesByBlogId.forEach(like => {
            likesMap[like.BlogId] = like.dataValues.likeCount;
            });
        let likedPosts = [];
        let dislikedPosts = [];
        if (token) {
            const userId = getUserId(token);
            const likedPostsData = await Like.findAll({
                where: { UserId: userId },
                attributes: ['BlogId']
            });
            const dislikedPostsData = await Dislike.findAll({
                where: { UserId: userId },
                attributes: ['BlogId']
            });
            likedPosts = likedPostsData.map(like => like.BlogId);
            dislikedPosts = dislikedPostsData.map(like => like.BlogId);
        }
        res.render('index', { cookies: req.cookies, blogs: blogs, likedPosts: likedPosts,likesMap:likesMap, dislikedPosts: dislikedPosts });
    } catch (error) {
        console.error(error);
       
    }
});


app.use('/blog', blogRoutes);
app.use('/like', likeRoutes);
app.use('/dislike', dislikeRoutes);
app.use('/user', userRoutes);
app.use('/follow', followRoutes);

// Associations
User.hasMany(Blog);
Blog.belongsTo(User);

User.hasMany(Like);
Like.belongsTo(User);

Blog.hasMany(Like);
Like.belongsTo(Blog);

User.hasMany(Dislike);
Dislike.belongsTo(User);

Blog.hasMany(Dislike);
Dislike.belongsTo(Blog);


User.hasMany(Follow, { foreignKey: 'user_id', as: 'Following' });
User.hasMany(Follow, { foreignKey: 'follower_id', as: 'Followers' });

Follow.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'Follower' });

sequelize.sync();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});