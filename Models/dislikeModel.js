const { DataTypes } = require('sequelize');
const Sequelize = require('../utils/database');

const DisLike = Sequelize.define('dislike', {
    dislike_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    disliked_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'dislike',
    timestamps: false
});

module.exports = DisLike;