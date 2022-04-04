"use strict"
module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define(
        "Admin",
        {
            email: { type: DataTypes.STRING(255), unique: true, allowNull: false },
            name: { type: DataTypes.STRING(255), allowNull: false },
            verified: { type: DataTypes.BOOLEAN, defaultValue: false },
            googleAuthVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
            password: { type: DataTypes.STRING(255), allowNull: false },
            googleAuthCode: { type: DataTypes.STRING(255) }
        }, {
            paranoid: true,
            defaultScope: { attributes: { exclude: ['password'] } },
            scopes: { login: { attributes: { exclude: [] } } }
        })
    return Admin
}

