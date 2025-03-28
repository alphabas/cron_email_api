const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');


const Log_email_sent = sequelize.define('log_email_sent', {

    ID_LOG : {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    USER_EMAIL:{
        type: DataTypes.STRING(50),
        allowNull: false
    },

    SENDER_USER:{
        type: DataTypes.STRING(120),
        allowNull: false
    },
    
    MESSAGE:{
        type: DataTypes.TEXT,
        allowNull: false
    },
 
    DATE_SENT:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue : DataTypes.NOW 
    },
   
}, {
    freezeTableName: true,
    tableName: 'log_email_sent',
    timestamps: false
})


module.exports = Log_email_sent

