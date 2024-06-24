const { DataTypes } = require('sequelize');
const Sequelize = require('../utils/database');

const Comment=Sequelize.define('Comment', {
    comment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    comment_content: {
        type: DataTypes.STRING,
        
    },
    comment_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Comment',
    timestamps: false
});