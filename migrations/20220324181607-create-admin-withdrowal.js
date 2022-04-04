'use strict'
module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.createTable("AdminWithdrawals", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            type: {
              type: Sequelize.STRING
            },
            tokenCode: {
                type: Sequelize.STRING
            },
            chainId: {
                type: Sequelize.STRING
            },
            address: {
                type: Sequelize.STRING
            },
            adminId: {
                type: Sequelize.INTEGER,
            },
            userWithdrawalId: {
                type: Sequelize.INTEGER,
            },
            value: {
                type: Sequelize.DECIMAL(27, 18),
            },
            status: {
                type: Sequelize.STRING,
                defaultValue: 'created',
            },
            transactionHash: {
                type: Sequelize.STRING
            },
            approvedBy: {
                type: Sequelize.STRING
            },
            data: {
                type: Sequelize.JSON
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deletedAt: {
                defaultValue: null,
                type: Sequelize.DATE
            }
        })
    },
    down: async (queryInterface, Sequelize) => {
        return queryInterface.dropTable("AdminWithdrawals")
    },
};
