const Sequelize = require('sequelize');
const AuditModel = require('../models/Audit');
const {DATABASE_NAME,USERNAME,PASSWORD,HOST,DIALECT} =require('./db.constants');
const sequelize = new Sequelize(DATABASE_NAME, USERNAME, PASSWORD, {
    host: HOST,
    dialect: DIALECT,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})
const Audit = AuditModel(sequelize, Sequelize)

sequelize.sync({ force: false })
.then(() => {
console.log(`Database & tables created here!`)
})
module.exports = {
    Audit
}