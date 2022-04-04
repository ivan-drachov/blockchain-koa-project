"use strict";

module.exports = (sequelize, DataTypes) => {
    const AirGappedAction = sequelize.define(
        "AirGappedAction",
        {
            uuid: { type: DataTypes.UUID },
            action: { type: DataTypes.STRING(50), defaultValue: 'native_transfer' },
            sender: { type: DataTypes.STRING(50) },
            receiver: { type: DataTypes.STRING(50) },
            status: { type: DataTypes.STRING(50) },
            tokenCode: { type: DataTypes.STRING(50) },
            chainId: { type: DataTypes.STRING(50) },
            value: { type: DataTypes.DECIMAL(27, 18) },
            transactionHash: { type: DataTypes.STRING(255) },
            data: { type: DataTypes.JSONB }

        },{
            paranoid: true
          })

    return AirGappedAction
}
module.exports.STATUS_CREATED = 'created'
module.exports.STATUS_CONFIRMED = 'confirmed'
module.exports.STATUS_ERROR = 'error'
module.exports.STATUS_EXPORTED = 'exported'
module.exports.STATUS_EXPORT_ERROR = 'export_error'
module.exports.STATUS_SENT = 'sent'
module.exports.STATUS_SENT_ERROR = 'sent_error'
module.exports.STATUS_SIGNED = 'signed'
module.exports.STATUS_SIGNED_ERROR = 'signed_error'
