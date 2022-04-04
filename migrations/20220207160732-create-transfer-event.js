'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("TransferEvents", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      blockNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      chainId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      sender: {
        type: Sequelize.STRING,
        allowNull: false
      },
      receiver: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(27, 18),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      tokenCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      body: {
        type: Sequelize.JSONB,
        allowNull: false
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
    return queryInterface.dropTable("TransferEvents")
  },
};