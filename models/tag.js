import { DataTypes, Model } from 'sequelize'

const tagSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUID,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        //other, pets, medicalHistory, fieds
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