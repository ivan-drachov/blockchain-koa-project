import fs from 'fs';
import path from 'path';

const baseName = path.basename(__filename);
const activeChainsIds = require('../enabledChainsIds');

const chainConfig = {}
fs.readdirSync(__dirname)
    .filter((chainConf) => chainConf.indexOf('.') !== 0 && chainConf !== baseName)
    .forEach((chainConf) => {
        const chainId = chainConf.split('.').slice(0, -1).join('.')
        if (activeChainsIds.includes(chainId)) {
            const data = require(path.join(__dirname, chainConf))
            data.chainId = chainId
            chainConfig[chainId] = data
        }
    });

module.exports = chainConfig
