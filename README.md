# testnet-status
Display and track various testnet's average throughput and transaction latencies

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  
  ###### Check out the badges hosted by [shields.io](https://shields.io/)

 [Deployed Heroku Link](https://testnet-status-7886b6dd6723.herokuapp.com)
  
  ## Description
  *A fullstack web app calculating average throughput and basic transaction latency in 30 minutes interval*

  > ![screeenshot](/client/src/assets/screenshot.png)

  ***

  ## Table of Contents
  - [Installation](#installation)
  - [Usage](#usage)
  - [Snippets](#snippets)
  - [License](#license)
  - [Author](#author)

  ***

  ## Installation

  ~~***This project is hosted on a heroku eco-dyno, when it is not being actively used it requires a bit extra start up time. This can be mitigated by upgrading to the next tier on heroku.***~~
  
  [Deployed Heroku Link](https://testnet-status-7886b6dd6723.herokuapp.com)
  
  If you would like to host a version of it yourself, please follow these instructions:

  > to install both the client and server side dependencies: `npm run install`

  > navigate to your mysql local server and srouce our schema

  > start the server: `npm start`, stop, then run our network seed file

  > to concurrently start server and client react code w/ hotreload: `npm run develop`

  ***This deployed project currently uses a wallet address's secret key set in the .env. (this will be the address where the testnet tokens are from) If hosting a standalone instance, please ensure both Alchemy API key, secret keys, and other variables are availble in .env***

  > **If you would like to host a heroku version of it privately**, make sure you have heroku CLI installed, and at the root of the project run `heroku create app_name`. After we confirmed that it has been deployed. Navigate to your heroku project page and ensure that all of your env var is set.
  >
  > ![envvar](/client/src/assets/envvar.png)
  >
  > *Some of those variable (such as DB_NAME, USER, PASSWORD, JAWSDB_URL) would be accessible after you connect jawsDB as an add on (free tier).*


  ***
  ## Usage

  Utilizing Alchemy's SDK endpoints for various networks, we query previous *5* blocks's transaction count and the time difference between those blocks to calculate our average throughput.

  > **Average Throughput**
  > - First we get the most current Block number using `alchemy.core.getBlockNumber()`
  > - then iterate through the past **5** blocks by using`*alchemy.core.getBlock(blockNum)` and to get the total tx counts and the time difference between the first and last block
  > - then we save the calculated throughput to our sql database

  Utilizing similar endpoints to our previous project to send testnet tokens, we are calculating the latency from when we signed and sent the transaction to the mempool to be mined vs when we received confirmation that the tx is mined. Originally I planned to utilize a hard coded gas fee, however that led to Polygon and Arbitrum's transaction to fail due to low gas / tip. We are also now utilizing variable gas price to ensure standards to minimize variable across different networks.

  > **Sending Transaction & Latencies**
  > 
  > We first need to instantiate our sender wallet with Alchemy SDK's `Wallet` implementation of `Signer`, and sign the transaction before using *`alchemy.transact.sendTransaction()`*
  >
  > *`alchemy.transact.sendTransaction()`* Requires:
  > - *network*
  > - *receiving address*
  > - *gasLimit*
  > - *maxPriorityFeePerGas* and *maxFeePerGas* from *`alchemy.core.getFeeData()`*
  > - *nonce* from *`getTransactionCount`*
  > - *value*

  We will then save the response we receive from *`alchemy.transact.sendTransaction()`* to our DB. At this point all we really have is our start time, and just a tx hash. Our transaction is sitting in the mempool waiting to be mined (our gas setting and alottment, along with network congestions would the speed of this process). 
  
  We have our listener set up (see [Snippets](#snippets)) so that it is constantly listening for any transactions that just got mined AND has our wallet as the sender. If it matches our own databases' transaction hashes, it updates our database record with the calculated latency between our start time, and the time of the block where our tx was mined.

  *I had also implemented an additional API route that refreshes any missed updates every 6 hours (one can initiate the refresh manually on front end too), as a stop gap measure just in case our transaction gets mined too quickly for our entries to be saved to our db*


  
  ***
  ## Snippets
  **API routes**
  > Alchemy SDK Average Throughput Calculation `/api/avg`
  > 
  > ![avg](/client/src/assets/avg.png)

  > Alchemy SDK Transactions Latencies `/api/newTx`
  >
  > ![netTx](/client/src/assets/newTx.png)

  > Refresh route `/api/refresh`
  >
  > ![refresh](/client/src/assets/refresh.png)

  > DB route `/api/getDB`
  >
  > ![DB](/client/src/assets/db.png)

  **Listener & Cron**
  > Server Listener
  >
  > ![listener](/client/src/assets/listener.png)

  > Cron Job schedule
  >
  > ![cron](client/src/assets/cron.png)

  ***
  ## License

  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  ***
  ## Author
  *Mari Ma*

  [<img src="https://res.cloudinary.com/dbjhly3lm/image/upload//h_50/v1682488301/personal%20assets/logo_github_icon_143196_phgakv.png" alt='github' >](https://github.com/DraconMarius)
  [<img src="https://res.cloudinary.com/dbjhly3lm/image/upload/h_50/v1682488301/personal%20assets/logo_linkedin_icon_143191_nv9tim.png" alt='linkedin'>](https://www.linkedin.com/in/mari-ma-70771585/)

[Icon credit @ Anton Kalashnyk](https://icon-icons.com/users/14quJ7FM9cYdQZHidnZoM/icon-sets/)

  ***
  ## Questions
  For any questions, please reach out directly or by creating an issue.


  