const Net = require("./net");
const Avg = require("./avg");
const Tx = require("./tx");

Net.hasMany(Avg, {
    foreignKey: "net_id"
});

Avg.belongsTo(Net, {
    foreignKey: "net_id",
});

Net.hasMany(Tx, {
    foreignKey: "net_id"
});


Tx.belongsTo(Net, {
    foreignKey: "net_id",
});

module.exports = { Net, Avg, Tx };