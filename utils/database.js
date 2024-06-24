const Sequelize=require('sequelize');

const dotenv = require('dotenv');
dotenv.config();



const sequelize = new Sequelize(process.env.db_name, process.env.u_name, process.env.password, {
    host: 'localhost',
    dialect: 'mysql',
    port: 3307
});

module.exports=sequelize;