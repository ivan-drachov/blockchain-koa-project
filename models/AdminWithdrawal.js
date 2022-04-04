"use strict"

const Withdrawal = require("./Withdrawal");

module.exports = (sequelize, DataTypes) => {
    const AdminWithdrawal = sequelize.define(
        "AdminWithdrawal",
        {
            type: { type: DataTypes.STRING(255) },
            tokenCode: { type: DataTypes.STRING(255) },
            chainId: { type: DataTypes.STRING(255) },
            address: { type: DataTypes.STRING(255) },
            adminId: { type: DataTypes.INTEGER },
            userWithdrawalId: { type: DataTypes.INTEGER },
            value: { type: DataTypes.DECIMAL(27, 18) },
            status: { type: DataTypes.STRING(255), defaultValue: 'created' },
            transactionHash: { type: DataTypes.STRING(255) },
            approvedBy: { type: DataTypes.STRING(255) },
            data: { type: DataTypes.JSON }
        },{
            paranoid: true
          })
        AdminWithdrawal.associate = (models) => {
            AdminWithdrawal.belongsTo(models.Withdrawal, {
                foreignKey: {
                name: 'userWithdrawalId'
                }
            }
        )};

    return AdminWithdrawal
}

module.exports.TYPE_WITHDRAW_APPROVE = 'withdraw_approve'
module.exports.TYPE_HOT_WALLET_RECYCLE = 'hot_wallet_recycle'
module.exports.TYPE_TO_ADDRESS = 'to_address'
module.exports.STATUS_BAD_ADDRESS = 'bad_address'
module.exports.STATUS_BAD_TOKEN_CHAIN = 'bad_token_or_chain'
module.exports.STATUS_CREATED = 'created'
module.exports.STATUS_INSUFFICIENT_FUNDS = 'insufficient_funds'
module.exports.STATUS_SENDING = 'sending'
module.exports.STATUS_ERROR_SENDING = 'error_sending'
module.exports.STATUS_SENT = 'sent'
