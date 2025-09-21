const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Manufacturer = sequelize.define('Manufacturer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    }, { timestamps: false });

    return Manufacturer;
};