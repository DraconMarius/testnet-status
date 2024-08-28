const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Tx extends Model { }

Tx.init({
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
    },
    tx_hash: {
        type: DataTypes.STRING(2000),
        allowNull: false,
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    latency: {
        type: DataTypes.STRING,
        alowNull: true,
    },
    maxFee_perGas: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    maxPriorityFee_perGas: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gas_price: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    underscored: true,
    freezeTableName: true,
    modelName: "tx",
});

module.exports = Tx;