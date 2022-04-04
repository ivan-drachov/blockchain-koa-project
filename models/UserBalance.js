"use strict";

module.exports = (sequelize, DataTypes) => {
    const UserBalance = sequelize.define(
        "UserBalance",
        {
            userId: { type: DataTypes.INTEGER },
            statusCode: { type: DataTypes.STRING(20), defaultValue: 'active' },
            tokenCode: { type: DataTypes.STRING(20), defaultValue: 'ACT'},
            balance: { type: DataTypes.DECIMAL(27, 18), defaultValue: '0'},
            dailyLimit: { type: DataTypes.INTEGER, defaultValue: 100}
        },{
            paranoid: true
        })
    return UserBalance
}
