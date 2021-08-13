const Sequelize = require('sequelize');
const AuditModel = require('../models/audit');
const ReviewModel = require('../models/review');
const EnvelopeModel = require('../models/envelope');
const MapModel = require('../models/map');
const {DATABASE_NAME,USERNAME,PASSWORD,HOST,DIALECT} =require('./db.constants');
const sequelize = new Sequelize(DATABASE_NAME, USERNAME, PASSWORD, {
    host: HOST,
    dialect: DIALECT,
    port: '3306',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})
const Audit = AuditModel(sequelize, Sequelize)
    ,Review = ReviewModel(sequelize, Sequelize)
    ,Envelope = EnvelopeModel(sequelize, Sequelize)
    ,Map = MapModel(sequelize, Sequelize);

Audit.hasMany(Review, {as: "reviews"});

sequelize.sync({ force: false })
.then(() => {
console.log(`Database & tables created here!`)
})
module.exports = {
    Audit,
    Review,
    Envelope,
    Map,
    sequelize
}