import { DataTypes, Model } from 'sequelize'

const tagSchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    type: {
        //0: other, 1: pets 2: medicalHistory
        type: DataTypes.ENUM('other', 'pets', 'medicalHistory', 'fields'),
        allowNull: false
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