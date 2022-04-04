'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("AirGappedActions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uuid: {
        type: Sequelize.UUID
      },
      chainId: {
        type: Sequelize.STRING
      },
      data: {
        type: Sequelize.JSONB
      },
      action: {
        type: Sequelize.STRING
      },
      sender: {
        type: Sequelize.STRING
      },
      receiver: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      tokenCode: {
        type: Sequelize.STRING
      },
      value: {
        type: Sequelize.DECIMAL(27, 18)
      },
      transactionHash: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable("AirGappedActions")
  },
};