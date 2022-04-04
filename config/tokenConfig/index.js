import fs from 'fs';
import path from 'path';

const baseName = path.basename(__filename);
const activeChainsIds = require('../enabledChainsIds');
const chainConfigObject = require('../chainConfig')
const tokenConfig = {}
fs.readdirSync(__dirname)
    .filter((tokenDir) => tokenDir.indexOf('.') !== 0 && tokenDir !== baseName)
    .forEach((tokenDir) => {
        tokenConfig[tokenDir] = {}
        fs.readdirSync(path.join(__dirname, tokenDir))
            .filter((chainConfig) => chainConfig.indexOf('.') !== 0 && chainConfig !== baseName)
            .forEach((chainConfig) => {
                const chainId = chainConfig.split('.').slice(0, -1).join('.')
                if (activeChainsIds.includes(chainId)) {
                    try {
                        const data = require(path.join(__dirname, tokenDir, chainConfig))
                        if(data.tokenContractAddress && data.tokenContractAddress !== ""){
                            data.tokenCode = tokenDir
                            data.chainId = chainId
                            data.chainConfig = chainConfigObject[chainId]
                            tokenConfig[tokenDir][chainId] = data
                        }
                    } catch (e){}
                }
            });
    });

module.exports = tokenConfig
