"use strict"
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            externalAddress: { type: DataTypes.STRING(255), allowNull: false },
            internalAddress:{ type: DataTypes.STRING(255) }
        },{
            paranoid: true
        })
    return User
}
