'use strict';
module.exports = (sequelize, DataTypes) => {
  const Deposit = sequelize.define(
    "Deposit",
    {
      chainId: { type: DataTypes.STRING(255), allowNull: false },
      tokenCode: { type: DataTypes.STRING(255), allowNull: false },
      blockNumber: { type: DataTypes.INTEGER},
      hash: { type: DataTypes.STRING(255), allowNull: false },
      sender: { type: DataTypes.STRING(255), allowNull: false },
      receiver: { type: DataTypes.STRING(255), allowNull: false },
      amount: { type: DataTypes.DECIMAL(27, 18) },
      status: { type: DataTypes.STRING(255), allowNull: false },
      body: { type: DataTypes.JSONB }
    },{
      paranoid: true
      })

    return Deposit
}
module.exports.STATUS_CREATED = 'created'
module.exports.STATUS_ERROR = 'error'
module.exports.TRANSACTION_GAS_FAILED = 'transaction_gas_failed'
module.exports.TRANSACTION_GAS_SUCCESS = 'transaction_gas_success'
module.exports.TRANSACTION_TOKEN_FAILED = 'transaction_token_failed'
module.exports.TRANSACTION_TOKEN_SUCCESS = 'transaction_token_success'
