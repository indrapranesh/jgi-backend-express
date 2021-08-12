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
        isCompleted: {
            type: type.BOOLEAN
        },
        finalReview: {
            type: type.BOOLEAN
        },
        createdAt: {
            allowNull: false,
            type: type.DATE
        },
        updatedAt: {
            allowNull: false,
            type: type.DATE
        }
    },
    {
      timestamps: true,
      underscrored: false,
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
    )
}