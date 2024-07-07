const sequelize = require('../utils/database');
const { DataTypes } = require('sequelize');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'Users',
        key: 'id'
        }
    },
    receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
        model: 'Users',
        key: 'id'
        }
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
  tableName: 'Message',
  timestamps: false
})


module.exports = Message;