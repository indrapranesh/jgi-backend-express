module.exports = (sequelize, type) => {
    return sequelize.define('Review', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        auditId: {
            type: type.INTEGER,
            references: {
               model: 'Audits', 
               key: 'id',
            }
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