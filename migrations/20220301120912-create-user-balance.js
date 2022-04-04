'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("UserBalances", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
      },
      statusCode: {
        type: Sequelize.STRING,
        defaultValue: 'active',
      },
      tokenCode: {
        type: Sequelize.STRING,
        defaultValue: 'ACT'
      },
      balance: {
        type: Sequelize.DECIMAL(27, 18),
        defaultValue: '0'
      },
      dailyLimit: {
        type: Sequelize.INTEGER,
        defaultValue: 100
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
    return queryInterface.dropTable("UserBalances")
  },
};