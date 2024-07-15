const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { getUserId, setUserId } = require('./Middleware/auth'); 
const sequelize = require('./utils/database');
const cors = require('cors');
const { Sequelize, where } = require('sequelize');
const socketIo = require('socket.io');
const http = require('http');


dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
    origin:"*",
}))

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const userRoutes = require('./Routes/userRoutes');
const blogRoutes = require('./Routes/blogRoutes');
const likeRoutes = require('./Routes/likeRoutes');
const dislikeRoutes = require('./Routes/dislikeRoutes');
const followRoutes = require('./Routes/followRoutes');
const messageRoutes = require('./Routes/messageRoutes');
// Models
const User = require('./Models/userModel');
const Blog = require('./Models/blogModel');
const Like = require('./Models/likeModels');
const Dislike = require('./Models/dislikeModel');
const Follow = require('./Models/followersModel');
const Message = require('./Models/messageModel');
const { userAuth } = require('./Filters/userAuth');


app.set('view engine', 'ejs');

app.get('/',userAuth, async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            attributes: {
                exclude: ['UserId']
            },
            include: [{
                model: User,
                attributes: ['username', 'fname', 'lname']
            }],
            order: [
                ['createdAt', 'DESC'] // Assuming you want to sort by creation date
            ]
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
app.use('/message', messageRoutes);

// Associations
User.hasMany(Blog);
Blog.belongsTo(User);

User.hasMany(Like);
Like.belongsTo(User);

Blog.hasMany(Like, {onDelete: 'CASCADE'});
Like.belongsTo(Blog);

User.hasMany(Dislike);
Dislike.belongsTo(User);

Blog.hasMany(Dislike,{onDelete: 'CASCADE'});
Dislike.belongsTo(Blog);


User.hasMany(Follow, { foreignKey: 'user_id', as: 'Following'});
User.hasMany(Follow, { foreignKey: 'follower_id', as: 'Followers'});

Follow.belongsTo(User, { foreignKey: 'user_id', as: 'User'});
Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'Follower'});

User.hasMany(Message, { foreignKey: 'sender_id', as: 'SentMessages'});
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'ReceivedMessages'});
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver'});

sequelize.sync();

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server is running at ${PORT}`);
});

const messageController = require('./Controllers/messageController');
const { timeStamp } = require('console');

io.on('connection', async (socket) => {
    let token = socket.handshake.auth.token;

    let userId = getUserId(token);
    
    let LogedInUser = await User.findOne({
    where: {
        id: userId
    },
    attributes: { exclude: ['id', 'password'] } 
});
    
  await User.update({ isLogin: 1 }, {
        where: {
            id: userId
        }
    });
    socket.broadcast.emit('UserLoggedIn', { username: LogedInUser.dataValues.username });
    
    socket.on('message', async (message) => {
        message.user_id = userId;
        let response = await messageController.addMessage({ body: message });
        if (response) {
            
            socket.broadcast.emit('message_added', { message_id: response.dataValues.id, content: message.content, sender: LogedInUser, timeStamp: response.dataValues.createdAt,receiver:message.username });
        }
        
    })
    socket.on('disconnect', async () => {
        await User.update({ isLogin: 0 }, {
        where: {
            id: userId
        }
        });
        socket.broadcast.emit('UserLoggedOut', {username:LogedInUser.dataValues.username});
    });
});