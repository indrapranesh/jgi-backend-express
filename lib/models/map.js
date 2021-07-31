module.exports = (sequelize, type) => {
    return sequelize.define('Map', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        latestVersion: {
            type: type.STRING
        },
        title: {
            type: type.STRING
        }
    })
}