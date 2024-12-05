

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');

const ProductOptions = sequelize.define('ProductOptions', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        references: {
          model: Product,
          key: 'id',
        },
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    shape: {
        type: DataTypes.ENUM('square', 'circle'),
        defaultValue: 'square',
    },
    radius: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    type: {
        type: DataTypes.ENUM('text', 'color'),
        defaultValue: 'text',
    },
    values: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
{
      sequelize,
      modelName: 'ProductOption',
      tableName: 'produto_opts',
      timestamps: true,
});

module.exports = ProductOptions;