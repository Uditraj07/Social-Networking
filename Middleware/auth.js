const jwt=require('jsonwebtoken');
const dotenv=require('dotenv');

dotenv.config();

const secret_key=process.env.secret_key;
const setUserId=(id)=>{
    return jwt.sign(id,secret_key);
}

const getUserId = (token) => {
    return jwt.verify(token,secret_key);
}

module.exports={
    setUserId,
    getUserId
}