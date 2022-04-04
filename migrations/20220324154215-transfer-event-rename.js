'use strict'
module.exports = {
    up(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.renameTable(
                'TransferEvents',
                'Deposits',
                {},
            ),
        ])
    },

    down(queryInterface, Sequelize) {
        return Promise.all([
            queryInterface.renameTable('TransferEvents', 'Deposits'),
        ])
    },
}
