const Net = require("./net");
const Avg = require("./avg");
const Tx = require("./tx");
const Error = require("./error");

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

Net.hasMany(Error, {
    foreignKey: "net_id"
});

Error.belongsTo(Net, {
    foreignKey: 'net_id',
});

module.exports = { Net, Avg, Tx, Error };