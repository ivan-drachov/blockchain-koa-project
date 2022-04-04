import db from "../../models"
import sequelize from "sequelize"

export default class UserService {

    static async getUserById(id) {
        return db.User.findOne({where: {id}})
    }

    static getUserByExternalAddress(externalAddress) {
        return db.User.findOne({
            where: {
                externalAddress: { [sequelize.Op.iLike]: externalAddress }
            }
        })
    }

    static getUserByInternalAddress(internalAddress) {
        return db.User.findOne({
            where: {
                internalAddress: { [sequelize.Op.iLike]: internalAddress }
            }
        })
    }

    static async getUsers(page, perPage) {
        return await db.User.findAndCountAll({
            order: [['id', 'DESC']],
            offset: (page - 1) * perPage, limit: perPage
        })
    }

    static async getDetails(addr, page, perPage, startDate, endDate) {

        let query =  {
            where:  {receiver: {[sequelize.Op.iLike]: addr}},
            order: [['id', 'DESC']]
        }
        if(startDate) query.where = {receiver : {[sequelize.Op.iLike]: addr},createdAt: {[sequelize.Op.gte]: startDate}}
        if(endDate) query.where = {receiver: {[sequelize.Op.iLike]: addr},createdAt: {[sequelize.Op.lte]: endDate}}
        if(startDate && endDate) query.where = {receiver : {[sequelize.Op.iLike]: addr},
            createdAt: {[sequelize.Op.gte]: startDate, [sequelize.Op.lte]: endDate}}
        if(page && perPage) query.offset = (page-1)*perPage
        if(perPage) query.limit = perPage
        return db.Deposit.findAndCountAll(query)
    }

    static async allDepositList( page, perPage, startDate, endDate) {
        return await db.Deposit.findAndCountAll({
            where: {
                    createdAt: {
                      [sequelize.Op.lte]: endDate,
                      [sequelize.Op.gte]: startDate
                    }
            },
            order: [['id', 'DESC']],
            offset: (page - 1) * perPage,
            limit: perPage
        })

    }

    static async createMapObject() {
        const hotAddr = process.env.HOT_W_ADDRESS
        const managerAddr = process.env.MANAGER_W_ADDRESS
        const coldAddr = process.env.COLD_W_ADDRESS
        const addressToName = {}
        addressToName[hotAddr] = "hot"
        addressToName[managerAddr] = "manager"
        addressToName[coldAddr] = "cold"
        let map = {
            nameToAddress: {
                "hot": hotAddr,
                "manager": managerAddr,
                "cold": coldAddr
            },
            addressToName
        }
        return map
    }

}
