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
        type: DataTypes.FLOAT,
        alowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    sequelize,
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    modelName: "tx",
});

module.exports = Tx;