module.exports = (sequelize, type) => {
    return sequelize.define('Envelope', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        reviewId: {
            type: type.INTEGER,
            references: {
               model: 'Reviews', 
               key: 'id',
            }
        },
        stakeHolderName: {
            type: type.STRING
        },
        envelopeId: {
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