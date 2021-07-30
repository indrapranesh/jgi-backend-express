module.exports = (sequelize, type) => {
    return sequelize.define('Audit', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        initialVersion: {
            type: type.STRING
        },
        finalVersion: {
            type: type.STRING
        },
        createdAt: {
            allowNull: false,
            type: type.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
            allowNull: false,
            type: type.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
    })
}