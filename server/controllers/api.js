const router = require("express").Router();
const { Net, Avg, Tx } = require("../db/models");

const { Alchemy, Network, Utils, Wallet } = require('alchemy-sdk');

const { calcAge } = require('../util/age');

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
    // Arbitrum: {
    //     apiKey: Key,
    //     network: Network.ARB_SEPOLIA
    // },
    // Optimism: {
    //     apiKey: Key,
    //     network: Network.OPT_SEPOLIA
    // },
    // Base: {
    //     apiKey: Key,
    //     network: Network.BASE_SEPOLIA
    // }
};

const chainId = {
    Eth: 11155111,
    Polygon: 80002,
    Arbitrum: 421614,
    Optimism: 11155420,
    Base: 84532
};

const getID = async (net) => {
    try {
        const results = await Net.findOne({
            where: {
                name: net
            }
        });
        idRes = results.get({ plain: true }); //<--- get plain true to return json data value
        // console.log(idRes)
        return (
            idRes.id
        );
    } catch (err) {
        console.error(err);
        throw err;
    }
};




router.post("/avg", async (req, res) => {
    console.log('==================average throughput==================');

    const fetchBlocks = async (net, config, id) => {
        const alchemy = new Alchemy(config);

        console.log(`id: ${id}`);
        try {
            const blockNum = await alchemy.core.getBlockNumber();
            const prevBlockNum = blockNum - 1;

            console.log(blockNum, "<--block Num");
            console.log(`${prevBlockNum}`);

            const block1 = await alchemy.core.getBlock(blockNum);
            const block2 = await alchemy.core.getBlock(prevBlockNum);
            console.log(block1);
            console.log(block2)

            console.log(`Block1 timestamp: ${block1.timestamp}`);
            console.log(`Block2 timestamp: ${block2.timestamp}`);

            // Calculate the time difference in seconds
            const tDiff = (block1.timestamp) - (block2.timestamp);

            console.log(`Time difference (seconds): ${tDiff}`);

            // Calculate average transactions per sec
            const averageTx = block1.transactions.length / tDiff;


            const newAvg = {
                net_id: id,
                count: block1.transactions.length,
                avgThroughput: averageTx,
                timestamp: new Date(block1.timestamp * 1000)
            };

            const newAvgData = await Avg.create(newAvg);


            return {
                [net]: {
                    avg: `${averageTx} Transactions per sec`,
                    db: { newAvgData }
                }
            };
        } catch (err) {
            console.error(`Failed to fetch average for ${net}`);
            console.error(err);
            return { [net]: "Error calculating average" };
        }
    };

    try {

        const results = await Promise.all(
            Object.entries(configs).map(async ([net, config]) => {
                const idData = await getID(net)

                return await fetchBlocks(net, config, idData);
            })
        );

        const combinedResults = results.reduce((net, result) => ({ ...net, ...result }), {});

        res.json(combinedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

router.post("/newTx", async (req, res) => {
    console.log('==================sending newTX==================');

    const sendTx = async (net, config, id) => {
        const alchemy = new Alchemy(config);
        const wallet = new Wallet(process.env.SECRET_KEY);

        try {
            const nonce = await alchemy.core.getTransactionCount(process.env.FROM_ADDRESS, "pending");
            console.log(`${nonce} <- nonce`);

            const valueETH = Utils.parseEther("0.00001");
            console.log(valueETH)

            const tx = {
                to: process.env.TO_ADDRESS,
                value: valueETH,
                gasLimit: "21000",
                maxPriorityFeePerGas: Utils.parseUnits("5", "gwei"),
                maxFeePerGas: Utils.parseUnits("20", "gwei"),
                nonce,
                type: 2,
                chainId: chainId[net],
            };

            const rawTx = await wallet.signTransaction(tx);
            const sentTx = await alchemy.transact.sendTransaction(rawTx);
            const startTime = new Date();

            console.log({ sentTx });
            // Store the new transaction in the database
            const newTx = await Tx.create({
                net_id: id,
                tx_hash: sentTx.hash,
                start_time: startTime,
                status: 'pending'
            });

            return newTx;
        } catch (err) {
            console.error(`Failed to send Tx on ${net} testnet`, err);
        }
    };

    try {
        const results = await Promise.all(
            Object.entries(configs).map(async ([net, config]) => {
                const idData = await getID(net);
                const alchemy = new Alchemy(config);
                const newTx = await sendTx(net, config, idData);

                return {
                    [net]: {
                        newTx
                    }
                }

            }))
        const combinedResults = results.reduce((net, result) => ({ ...net, ...result }), {});
        res.json(combinedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err });
    }
});

//now using web socket in server.js

router.put("/forceUpdate", async (req, res) => {
    console.log('==================checking and update status==================');

    const checkIfPending = async (netName) => {
        try {
            const prevTx = await Tx.findOne({
                include: [
                    {
                        model: Net,
                        where: { name: netName },
                        attributes: []
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            // console.log(prevTx);
            // If no transaction exists, return pending as false
            if (!prevTx) {
                return { txHash: null, pending: "complete" };
            }

            // Return the transaction hash and pending status
            return { txHash: prevTx.tx_hash, pending: prevTx.status, startTime: prevTx.start_time };

        } catch (err) {
            console.error(`Error checking transaction status for net name ${netName}:`, err);
            return { err };
        }
    };

    try {
        const results = await Promise.all(
            Object.entries(configs).map(async ([net, config]) => {
                const idData = await getID(net);
                const pendingTx = await checkIfPending(net);
                console.log(pendingTx)
                const alchemy = new Alchemy(config);
                if (!pendingTx.txHash || pendingTx.pending === "complete") {
                    return { [net]: !pendingTx.txHash ? "no previous hash" : `previous hash already complete: ${pendingTx.txHash}` }
                }

                //try to get mined Time
                const receipt = await alchemy.transact.getTransaction(pendingTx.txHash)

                if (receipt.confirmations > 0) {
                    const block = await alchemy.core.getBlock(receipt.blockNumber)
                    // console.log(block)
                    const endTime = new Date(block.timestamp * 1000)
                    // console.log(receipt.hash)
                    const findTxStart = await Tx.findOne({
                        where: {
                            tx_hash: receipt.hash,
                        },
                        attributes: ['start_time'], // Retrieve only the start_time
                    })
                    const startTime = findTxStart.get({ plain: true });

                    console.log(endTime, "endTime")
                    console.log(startTime.start_time, "startTime")
                    const latency = calcAge(startTime.start_time, endTime);
                    console.log(latency)
                    // Update the transaction status and latency
                    const updateDB = await Tx.update({
                        end_time: endTime,
                        latency,
                        status: 'complete'
                    }, {
                        where: {
                            tx_hash: receipt.hash,
                        }
                    })

                    return {
                        [net]: {
                            receipt,
                            updateDB
                        }
                    }
                } else {
                    return {
                        [net]: "Transaction still pending"
                    }
                }

            }))
        const combinedResults = results.reduce((net, result) => ({ ...net, ...result }), {});
        res.json(combinedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;