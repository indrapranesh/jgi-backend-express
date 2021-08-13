module.exports = (sequelize, type) => {
    return sequelize.define('Review', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        finalReview: {
            type: type.BOOLEAN
        },
        finalVersion: {
            type: type.STRING
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