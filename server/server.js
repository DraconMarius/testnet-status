const path = require("path");
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cron = require('node-cron');
const axios = require('axios');
const WebSocket = require('ws');

const SequalizeStore = require("connect-session-sequelize")(session.Store);

const routes = require("./controllers/index.js");
const sequelize = require('./db/config/connection');

const app = express();

const PORT = process.env.PORT || 3001;

const Net = require("./db/models/net");
const Avg = require("./db/models/avg");
const Tx = require("./db/models/tx");

const { Alchemy, Network, AlchemySubscription, Utils } = require('alchemy-sdk');
const { calcAge } = require('./util/age');
const Key = process.env.ALCHEMY_API_KEY;


const configs = {
    Eth: {
        apiKey: Key,
        network: Network.ETH_SEPOLIA
    },
    Polygon: {
        apiKey: Key,
        network: Network.MATIC_AMOY
    },
    Arbitrum: {
        apiKey: Key,
        network: Network.ARB_SEPOLIA
    },
    // Optimism: {
    //     apiKey: Key,
    //     network: Network.OPT_SEPOLIA
    // },
    Base: {
        apiKey: Key,
        network: Network.BASE_SEPOLIA
    }
};

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

const sess = {
    secret: process.env.SECRET,
    cookies: {},
    resave: false,
    saveUninitialized: true,
    store: new SequalizeStore({
        db: sequelize,
    })
};

app.use(session(sess));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(routes)

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

let wss

const notifyClients = (data) => {
    console.log('Notifying clients:', data);
    if (wss) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
};

sequelize.sync({ force: false })
    .then(() => Net.sync())
    .then(() => Avg.sync())
    .then(() => Tx.sync())
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`now listening at http://localhost:${PORT}/`);
        });
        wss = new WebSocket.Server({ server });

        wss.on('connection', (ws) => {
            console.log('Frontend connected');

            ws.on('close', () => {
                console.log('Frontend disconnected');
            });
        });


        const webSockets = {};
        // console.log(process.env.FROM_ADDRESS)

        Object.entries(configs).forEach(([net, config]) => {
            const alchemy = new Alchemy(config);
            webSockets[net] = alchemy.ws;

            alchemy.ws.on('open', () => {
                console.log(`Alchemy WebSocket connection opened for ${net} testnet`);
            });

            alchemy.ws.on({
                method: AlchemySubscription.MINED_TRANSACTIONS,
                addresses: [
                    {
                        from: process.env.FROM_ADDRESS,
                        to: process.env.TO_ADDRESS,
                    }]
            }, async (tx) => {
                // console.log({ tx });
                try {
                    // Look up the transaction in the database by its hash
                    const foundTx = await Tx.findOne({ where: { tx_hash: tx.transaction.hash } });

                    if (foundTx) {
                        // The transaction is found and confirmed
                        const receipt = await alchemy.transact.getTransaction(tx.transaction.hash);
                        const block = await alchemy.core.getBlock(receipt.blockNumber);
                        const endTime = new Date(block.timestamp * 1000);

                        const latency = calcAge(foundTx.start_time, endTime);

                        // Update the transaction in the database
                        await Tx.update({
                            end_time: endTime,
                            latency,
                            status: 'complete',
                            gas_price: Utils.formatUnits(receipt.gasPrice, 'gwei')
                        }, {
                            where: { tx_hash: tx.transaction.hash }
                        });

                        console.log(`Transaction ${tx.transaction.hash} confirmed and updated in the database for ${net}.`);
                        //send signal to front to refresh
                        notifyClients({ message: 'update' });
                    } else {
                        console.log(`Transaction ${tx.transaction.hash} not found in the database for ${net}.`);
                    }
                } catch (err) {
                    console.error(`Error processing mined transaction on ${net}:`, err);
                }
            });

            alchemy.ws.on('error', (error) => {
                console.error(`Alchemy WebSocket error on ${net} testnet:`, error);
            });

            alchemy.ws.on('close', () => {
                console.log(`Alchemy WebSocket connection closed for ${net} testnet`);
            });
        });
    });


// Schedule API calls every 30 minutes to create new transactions
cron.schedule('0,30 * * * *', async () => {
    console.log('Scheduling new transactions every 30 minutes.');

    try {
        const response = await axios.post('/api/newTx', {}, {
            baseURL: process.env.NODE_ENV === 'production'
                ? 'https://testnet-status-7886b6dd6723.herokuapp.com'
                : 'http://localhost:3001'
        });
        console.log('New transactions response:', response.data);
        notifyClients({ message: 'update' });
    } catch (err) {
        console.error('Error scheduling new transactions:', err);
    }
});

// Schedule API calls every 30 minutes to calculate average throughput
cron.schedule('0,30 * * * *', async () => {
    console.log('Scheduling average throughput calculation every 30 minutes.');

    try {
        const response = await axios.post('/api/avg', {}, {
            baseURL: process.env.NODE_ENV === 'production'
                ? 'https://testnet-status-7886b6dd6723.herokuapp.com'
                : 'http://localhost:3001'
        });
        console.log('Average throughput response:', response.data);
    } catch (err) {
        console.error('Error scheduling average throughput calculation:', err);
    }
});

// Schedule API calls every 30 minutes to calculate average throughput
cron.schedule('0 */6 * * *', async () => {
    console.log('Scheduling refresh every 6 hours just incase');

    try {
        const response = await axios.post('/api/refresh', {}, {
            baseURL: process.env.NODE_ENV === 'production'
                ? 'https://testnet-status-7886b6dd6723.herokuapp.com'
                : 'http://localhost:3001'
        });
        console.log('Average throughput response:', response.data);
    } catch (err) {
        console.error('Error scheduling average throughput calculation:', err);
    }
});