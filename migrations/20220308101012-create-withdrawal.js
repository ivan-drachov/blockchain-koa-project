'use strict'
module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.createTable("Withdrawals", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
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
            userId: {
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
            }
        })
    },
    down: async (queryInterface, Sequelize) => {
        return queryInterface.dropTable("Withdrawals")
    },
};