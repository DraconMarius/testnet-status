const sequelize = require('../config/connection')
const Net = require('../models/net')

const netSeed = [
    {
        name: "Eth",
        rpc_url: "https://ethereum-sepolia.gateway.tatum.io",
    },
    {
        name: "Polygon",
        rpc_url: "https://polygon-amoy.gateway.tatum.io"
    },
    {
        name: "Optimism",
        rpc_url: "https://optimism-testnet.gateway.tatum.io"
    },
    {
        name: "Arbitrum",
        rpc_url: "https://arbitrum-sepolia.drpc.org"
    },
    {
        name: "Base",
        rpc_url: "https://base-sepolia.gateway.tatum.io"
    }
];

const seedData = async () => {

    await Net.bulkCreate(netSeed);

    process.exit(0);
};

seedData();