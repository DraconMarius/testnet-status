const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Avg extends Model { }

Avg.init({
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
    count: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    avgThroughput: {
        type: DataTypes.STRING(2000),
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
    modelName: "avg",
});

module.exports = Avg