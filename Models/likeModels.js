const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');


const Like = sequelize.define('Like', {
    like_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    liked_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Likes',
    timestamps: false
});

module.exports = Like;