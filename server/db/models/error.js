const { Model, DataTypes } = require("sequelize");
const sequelize = require('../config/connection');

class Error extends Model { };

Error.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    net_id: {
        type: DataTypes.INTEGER,
        references: {
            model: "net",
            key: "id",
        },
        allowNull: false,
    },
    error_msg: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
    }

}, {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: "error",
});

module.exports = Error;