'use strict'
require('dotenv').config()
const PasswordUtil = require('../app/utils/password.util')
if (!process.env.ADMIN_PASSWORD) {
    console.log('Set ADMIN_PASSWORD in .env')
}
module.exports = {
    async up (queryInterface, Sequelize) {

        return queryInterface.bulkInsert('Admins', [{
            id: 1,
            email: 'admin@gmail.com',
            name: 'Admin',
            password: PasswordUtil.saltHashPassword(process.env.ADMIN_PASSWORD),
            verified: true,
            googleAuthVerified: false,
            googleAuthCode: null,
            createdAt: (new Date()),
            updatedAt: (new Date())
        }], {})
    },

    async down (queryInterface, Sequelize) {
        return queryInterface.bulkDelete('Admins', null, {})
    }
}
