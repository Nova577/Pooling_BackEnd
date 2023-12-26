import { DataTypes, Model } from 'sequelize'

const tagSchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    tag: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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