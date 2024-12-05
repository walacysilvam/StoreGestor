
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./Product');
const Category = require('./Category');

const ProductCategory = sequelize.define('ProductCategory', {
    product_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id',
        },
        allowNull: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Category,
            key: 'id',
        },
        allowNull: false,
    },
}, {
    tableName: 'produto_categoria',
    timestamps: false, // nesse caso não precisa.
});

module.exports = ProductCategory;