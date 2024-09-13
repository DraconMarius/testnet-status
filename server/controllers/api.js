const router = require("express").Router();
const { Net, Avg, Tx } = require("../db/models");

const { Alchemy, Network, Utils, Wallet } = require('alchemy-sdk');

const { calcAge, getTime } = require('../util/age');

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

    const fetchBlocks = async (net, config, id, numBlocks = 5) => {

        const alchemy = new Alchemy(config);

        console.log(`id: ${id}`);
        try {
            let blockNum = await alchemy.core.getBlockNumber();
            let totalTxCount = 0;
            let earliestBlockTimestamp, latestBlockTimestamp;

            // console.log(`${net}: Querying the last ${numBlocks} blocks`);

            // Loop through the last `numBlocks` blocks
            for (let i = 0; i < numBlocks; i++) {
                const currentBlock = await alchemy.core.getBlock(blockNum);
                totalTxCount += currentBlock.transactions.length;

                // Track the earliest and latest timestamps
                if (i === 0) {
                    latestBlockTimestamp = currentBlock.timestamp;
                }
                if (i === numBlocks - 1) {
                    earliestBlockTimestamp = currentBlock.timestamp;
                }

                console.log(`${net}'s Block ${blockNum} transaction count: ${currentBlock.transactions.length}`);
                console.log(`${net}'s Block ${blockNum} timestamp: ${currentBlock.timestamp}`);

                // Move to the previous block
                blockNum -= 1;
            }

            // Calculate the total time difference between the earliest and latest blocks
            const tDiff = latestBlockTimestamp - earliestBlockTimestamp;
            // console.log(`${net}'s Total time difference (seconds) across ${numBlocks} blocks: ${tDiff}`);

            // Calculate average transactions per second
            const averageTx = (totalTxCount / tDiff).toFixed(4);

            // getting standardized createTime stamp
            const timeslot = getTime();
            // console.log({ timeslot }, net);

            // console.log(`${net}'s average throughput: ${averageTx} Transactions per sec`);

            const newAvg = {
                net_id: id,
                count: totalTxCount,  // Total transaction count from all queried blocks
                avgThroughput: Number(averageTx),  // Ensure it's stored as a number
                timestamp: timeslot
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
                const idData = await getID(net);

                return await fetchBlocks(net, config, idData, 5);
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
            const gasPrices = await alchemy.core.getFeeData();
            const maxPriorityFeePerGas = gasPrices.maxPriorityFeePerGas;
            const polygonPriority = Number.parseInt(Utils.formatUnits(maxPriorityFeePerGas, 'wei'), 10) + 23500000000
            const maxFeePerGas = gasPrices.maxFeePerGas;
            const polygonMax = Number.parseInt(Utils.formatUnits(maxFeePerGas, 'wei'), 10) + 23500000000
            console.log({ [net]: { gasPrices, maxPriorityFeePerGas: Utils.formatUnits(maxPriorityFeePerGas, 'wei'), maxFeePerGas: Utils.formatUnits(maxFeePerGas, 'wei') } })
            // console.log(`${net} Gas Prices:', { maxPriority: ${maxPriorityFeePerGas}, maxFee: ${maxFeePerGas} }`);
            const timeslot = getTime();

            const nonce = await alchemy.core.getTransactionCount(process.env.FROM_ADDRESS, "pending");
            console.log(`${nonce} <- nonce`);

            const valueETH = Utils.parseEther("0.00001");
            // console.log(valueETH);

            const tx = {
                to: process.env.TO_ADDRESS,
                value: valueETH,
                gasLimit: "30000",
                maxPriorityFeePerGas: net === "Polygon" ? polygonPriority : maxPriorityFeePerGas,
                maxFeePerGas: net === "Polygon" ? polygonMax : maxFeePerGas,
                nonce,
                type: 2,
                chainId: chainId[net],
            };

            const rawTx = await wallet.signTransaction(tx);
            const startTime = new Date();
            const sentTx = await alchemy.transact.sendTransaction(rawTx);

            console.log({ [net]: sentTx });
            // Store the new transaction in the database
            const newTx = await Tx.create({
                net_id: id,
                tx_hash: sentTx.hash,
                start_time: startTime,
                status: 'pending',
                timestamp: timeslot,
                maxPriorityFee_perGas: Utils.formatUnits(maxPriorityFeePerGas, 'gwei'),
                maxFee_perGas: Utils.formatUnits(maxFeePerGas, 'gwei'),
            });

            return newTx;
        } catch (err) {
            // const newTx = await Tx.create({
            //     net_id: id,
            //     tx_hash: "error",
            //     start_time: startTime,
            //     status: 'error',
            //     timestamp: timeslot,
            //     maxPriorityFee_perGas: Utils.formatUnits(maxPriorityFeePerGas, 'gwei'),
            //     maxFee_perGas: Utils.formatUnits(maxFeePerGas, 'gwei'),
            // });
            console.error(`Failed to send Tx on ${net} testnet`, err);
        }
    };

    try {
        const results = await Promise.all(
            Object.entries(configs).map(async ([net, config]) => {
                const idData = await getID(net);
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

// router.put("/forceUpdate", async (req, res) => {
//     console.log('==================checking and update status==================');

//     const checkIfPending = async (netName) => {
//         try {
//             const prevTx = await Tx.findOne({
//                 include: [
//                     {
//                         model: Net,
//                         where: { name: netName },
//                         attributes: []
//                     }
//                 ],
//                 order: [['createdAt', 'DESC']]
//             });
//             // console.log(prevTx);
//             // If no transaction exists, return pending as false
//             if (!prevTx) {
//                 return { txHash: null, pending: "complete" };
//             }

//             // Return the transaction hash and pending status
//             return { txHash: prevTx.tx_hash, pending: prevTx.status, startTime: prevTx.start_time };

//         } catch (err) {
//             console.error(`Error checking transaction status for net name ${netName}:`, err);
//             return { err };
//         }
//     };

//     try {
//         const results = await Promise.all(
//             Object.entries(configs).map(async ([net, config]) => {
//                 const idData = await getID(net);
//                 const pendingTx = await checkIfPending(net);
//                 // console.log(pendingTx)
//                 const alchemy = new Alchemy(config);
//                 if (!pendingTx.txHash || pendingTx.pending === "complete") {
//                     return { [net]: !pendingTx.txHash ? "no previous hash" : `previous hash already complete: ${pendingTx.txHash}` }
//                 }

//                 //try to get mined Time
//                 const receipt = await alchemy.transact.getTransaction(pendingTx.txHash)

//                 if (receipt.confirmations > 0) {
//                     const block = await alchemy.core.getBlock(receipt.blockNumber)
//                     // console.log(block)
//                     const endTime = new Date(block.timestamp * 1000)
//                     // console.log(receipt.hash)
//                     const findTxStart = await Tx.findOne({
//                         where: {
//                             tx_hash: receipt.hash,
//                         },
//                         attributes: ['start_time'], // Retrieve only the start_time
//                     })
//                     const startTime = findTxStart.get({ plain: true });

//                     // console.log(endTime, "endTime")
//                     // console.log(startTime.start_time, "startTime")
//                     const latency = calcAge(startTime.start_time, endTime);
//                     // console.log(latency)
//                     // Update the transaction status and latency
//                     const updateDB = await Tx.update({
//                         end_time: endTime,
//                         latency,
//                         status: 'complete'
//                     }, {
//                         where: {
//                             tx_hash: receipt.hash,
//                         }
//                     })

//                     return {
//                         [net]: {
//                             receipt,
//                             updateDB
//                         }
//                     }
//                 } else {
//                     return {
//                         [net]: "Transaction still pending"
//                     }
//                 }

//             }))
//         const combinedResults = results.reduce((net, result) => ({ ...net, ...result }), {});
//         res.json(combinedResults);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: err.message });
//     }
// });

router.get("/getDB", async (req, res) => {
    console.log('==================getting DB data==================');

    try {
        const results = await Promise.all(
            Object.entries(configs).map(async ([net, _config]) => {
                const idData = await getID(net);

                // Query for Avg and Tx data for the given network
                const avgData = await Avg.findAll({
                    where: { net_id: idData },
                    order: [['timestamp', 'DESC']]
                });
                // console.log({ avgData })

                const txData = await Tx.findAll({
                    where: { net_id: idData },
                    order: [['timestamp', 'DESC']]
                });
                // console.log({ txData })

                const combinedData = avgData.map(avg => {
                    const matchingTx = txData.find(tx => tx.timestamp.getTime() === avg.timestamp.getTime());
                    return {
                        time: avg.timestamp,
                        avg: avg,
                        tx: matchingTx
                    };
                });

                return { [net]: combinedData };
            })
        );

        // Combine the results into a single object
        const combinedResults = results.reduce((acc, result) => ({ ...acc, ...result }), {});
        console.log(combinedResults);

        res.json(combinedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/refresh", async (req, res) => {
    console.log('==================refreshing pending transactions==================');

    try {
        const results = await Promise.all(
            Object.entries(configs).map(async ([net, config]) => {
                const idData = await getID(net);

                // Fetch all pending transactions for the current network
                const pendingTxs = await Tx.findAll({
                    where: {
                        net_id: idData,
                        status: 'pending'
                    },
                    order: [['createdAt', 'ASC']]
                });

                const alchemy = new Alchemy(config);

                const updatedTxs = await Promise.all(pendingTxs.map(async (tx) => {
                    try {
                        // Check the status of the transaction on the blockchain
                        const receipt = await alchemy.transact.getTransaction(tx.tx_hash);

                        if (receipt && receipt.confirmations > 0) {
                            // If the transaction has been confirmed, update its status in the database
                            const block = await alchemy.core.getBlock(receipt.blockNumber);
                            const endTime = new Date(block.timestamp * 1000);
                            const latency = calcAge(tx.start_time, endTime);

                            await Tx.update({
                                end_time: endTime,
                                latency,
                                status: 'complete'
                            }, {
                                where: { tx_hash: tx.tx_hash }
                            });

                            console.log(`Transaction ${tx.tx_hash} confirmed and updated in the database for ${net}.`);

                            return {
                                tx_hash: tx.tx_hash,
                                status: 'complete',
                                updated: true
                            };
                        } else {
                            console.log(`Transaction ${tx.tx_hash} pending still for ${net}.`);

                            return {
                                tx_hash: tx.tx_hash,
                                status: 'pending',
                                updated: false
                            };
                        }
                    } catch (error) {
                        console.error(`Error checking transaction ${tx.tx_hash} on ${net}:`, error);
                        return {
                            tx_hash: tx.tx_hash,
                            status: 'pending',
                            updated: false,
                            error: error.message
                        };
                    }
                }));

                return { [net]: updatedTxs };
            })
        );

        const combinedResults = results.reduce((acc, result) => ({ ...acc, ...result }), {});
        console.log(combinedResults);

        res.json(combinedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;