const { Model, DataTypes } = require("sequelize");
const sequelize = require("./config/connection");

class Net extends Model { }

Net.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrements: true,
    },
    Name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    rpc_url: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    timestamps: true,
    undescored: true,
    modelName: "net",
});

module.exports = Net