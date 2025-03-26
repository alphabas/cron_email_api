const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../../utils/sequerize');
const Indistry_category = require('../indistry_category/Indistry_category');
const Census_block = require('../census_block/Census_block');



const Recensement = sequelize.define('recensement_cityzen', {

    id : {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name:{
        type: DataTypes.STRING(50),
        allowNull: false
    },

    indistry_category_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    
    census_block_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
 
    adress:{
        type: DataTypes.STRING(200),
        allowNull: false
    },
    city:{
        type: DataTypes.STRING(200),
        allowNull: false
    },

    code_postal:{
        type: DataTypes.STRING(200),
        allowNull: false
    },
    city:{
        type: DataTypes.STRING(200),
        allowNull: false
    },
    latitude:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    longitude:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },

    date_created:{
        type: DataTypes.DATE,
        allowNull:true,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    tableName: 'recensement_cityzen',
    timestamps: false
})


Recensement.belongsTo(Indistry_category, {
    foreignKey: "indistry_category_id",
    as: "indistry_category",
  });


Recensement.belongsTo(Census_block, {
    foreignKey: "census_block_id",
    as: "census_block",
  });
module.exports = Recensement

