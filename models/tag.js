import { DataTypes, Model } from 'sequelize'

const tagSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        //other, pets, medicalHistory, researchFields
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'other'
    }   
}
class Tag extends Model {}

function tagInit(sequelize) {
    Tag.init(tagSchema, {
        sequelize,
        timestamps: false,
        paranoid: true
    })
}

export {
    tagInit,
    Tag
}