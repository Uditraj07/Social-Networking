
const { Router } = require('express');
const router = Router();

const {userAuth, userNoauth}=require('../Filters/userAuth')

const blogController = require('../Controllers/blogController');

const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });


router.get('/add-blog',userAuth, (req, res, next) => {
    return res.render('add_blog', {cookies:req.cookies});
})

router.post('/add-blog', userAuth,upload.single("coverImage") ,blogController.create_blog);

router.get('/', blogController.allBlog);

module.exports = router;

