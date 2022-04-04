"use strict"

module.exports = (sequelize, DataTypes) => {
    const Withdrawal = sequelize.define(
        "Withdrawal",
        {
            tokenCode: { type: DataTypes.STRING(255) },
            chainId: { type: DataTypes.STRING(255) },
            address: { type: DataTypes.STRING(255) },
            userId: { type: DataTypes.INTEGER },
            value: { type: DataTypes.DECIMAL(27, 18) },
            status: { type: DataTypes.STRING(255), defaultValue: 'created' },
            transactionHash: { type: DataTypes.STRING(255) },
            approvedBy: { type: DataTypes.STRING(255) },
            data: { type: DataTypes.JSON }
        },{
            paranoid: true
        })
    return Withdrawal
}
module.exports.STATUS_CREATED = 'created'
module.exports.STATUS_SENT = 'sent'
module.exports.STATUS_SENDING = 'sending'
module.exports.STATUS_ERROR_SENDING = 'error_sending'
module.exports.STATUS_INSUFFICIENT_FUNDS = 'insufficient_funds'
module.exports.STATUS_BAD_ADDRESS = 'bad_address'
module.exports.STATUS_BAD_TOKEN_CHAIN = 'bad_token_or_chain'









