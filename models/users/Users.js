const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');


const Users = sequelize.define('users', {

    ID_USER  : {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    NAME_USER:{
        type: DataTypes.STRING(120),
        allowNull: false
    },

    EMAIL_USER:{
        type: DataTypes.STRING(150),
        allowNull: false
    },
    
    IP_USER:{
        type: DataTypes.STRING(120),
        allowNull: false
    },

}, {
    freezeTableName: true,
    tableName: 'users',
    timestamps: false
})



module.exports = Users

