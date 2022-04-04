'use strict'
module.exports = {
  up(queryInterface, Sequelize) {
    return Promise.all([
     queryInterface.addColumn(
          'Admins',
          'deletedAt',
          {
            type: Sequelize.DATE,
            default: null
          },
      ),
      queryInterface.addColumn(
        'AirGappedActions',
        'deletedAt',
        {
          type: Sequelize.DATE,
          default: null
        },
    ),
    queryInterface.addColumn(
      'Deposits',
      'deletedAt',
      {
        type: Sequelize.DATE,
        default: null
      },
    ),
    queryInterface.addColumn(
      'UserBalances',
      'deletedAt',
      {
        type: Sequelize.DATE,
        default: null
      },
    ),
    queryInterface.addColumn(
      'Users',
      'deletedAt',
      {
        type: Sequelize.DATE,
        default: null
      },
    ),
    queryInterface.addColumn(
      'Withdrawals',
      'deletedAt',
      {
        type: Sequelize.DATE,
        default: null
      },
    )
    ])
  },

  down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn('Admins', 'deletedAt'),
      queryInterface.removeColumn('AirGappedActions', 'deletedAt'),
      queryInterface.removeColumn('Deposits', 'deletedAt'),
      queryInterface.removeColumn('UserBalances', 'deletedAt'),
      queryInterface.removeColumn('Users', 'deletedAt'),
      queryInterface.removeColumn('Withdrawals', 'deletedAt')
    ])
  },
}

