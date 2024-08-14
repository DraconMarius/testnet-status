const router = require("express").Router();
const { Net, Avg, Tx } = require("../db/models");

const { Alchemy, Network, Utils } = require('alchemy-sdk');

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

router.get("/pending", async (req, res) => {
    console.log('==================DB has Tx Pending?==================');
    const checkIfPending = async (netName) => {
        try {
            // Find the most recent transaction for the given net name
            const prevTx = await Tx.findOne({
                include: [
                    {
                        model: Net,
                        where: { name: netName }, // Filter by net name
                        attributes: [] // Exclude Net model attributes from the result
                    }
                ],
                order: [['createdAt', 'DESC']] // Order by the most recent transaction
            });

            // If no transaction exists, return false
            if (!prevTx) {
                return {
                    [netName]: false
                };
            }

            // Check if the transaction status is 'pending'
            if (prevTx.status === 'pending') {
                return {
                    [netName]: true
                };
            } else {
                return {
                    [netName]: false
                };
            }
        } catch (err) {
            console.error(`Error checking transaction status for net name ${netName}:`, err);
            return {
                [netName]: false
            };;
        }
    };

    try {
        const results = await Promise.all(
            Object.entries(configs).map(([net, config]) => {
                return checkIfPending(net);
            })
        );

        const combinedResults = results.reduce((net, result) => ({ ...net, ...result }), {});

        res.json(combinedResults);
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }


});

router.post("")
module.exports = router;