const {Router}=require('express');
const userController=require('../Controllers/userControllers');

const {userAuth, userNoauth}=require('../Filters/userAuth')
const router=Router();

router.get('/login',userNoauth,(req,res,next)=>{
    res.render('login', {cookies:req.cookies})
})
router.post('/login',userNoauth,userController.signin);

router.get('/signup',userNoauth,(req,res,next)=>{
    res.render('signup',{cookies:req.cookies})
})
router.post('/signup', userNoauth, userController.register);

router.get('/logout', (req, res) => {
    res.clearCookie("user_id");
    return res.redirect('/');
})

router.get('/user-details',userAuth, userController.userDetails);




module.exports=router;