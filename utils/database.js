const Sequelize=require('sequelize');

const dotenv = require('dotenv');
dotenv.config();

const dbHost = process.env.db_host;
const dbPort = process.env.db_port;

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(process.env.db_name, process.env.u_name, process.env.password, {
    host: dbHost,
    dialect: 'mysql',
    port: dbPort,
});

module.exports=sequelize;