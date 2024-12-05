
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');

const ProductImage = sequelize.define('ProductImage', {
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
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    
},{
    sequelize,
    tableName: 'produto_imgs',
    timestamps: true,
});


module.exports = ProductImage;