const chainsEnv = process.env.NODE_ENV || 'development'
let activeChainsIds
if (chainsEnv === 'production') {
    // Eth Mainnet
    activeChainsIds = ['1'];
} else {
    //Leucine X, Eth Testnet Ropsten
    // activeChainsIds = ['13370','3']
    //Leucine X, Leucine 100, Leucine 101, Eth Testnet Ropsten
    // activeChainsIds = ['13370','31337','31338','3','80001']
    activeChainsIds = ['13370','31337','3','80001']
}
module.exports = activeChainsIds
