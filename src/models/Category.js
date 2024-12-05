
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    use_in_menu: {
        type: DataTypes.BOOLEAN,
        defaultValue: false         // valor default -> 0
    },
}, {
    tableName: 'Categorias',
    timestamps: true,
});

module.exports = Category;