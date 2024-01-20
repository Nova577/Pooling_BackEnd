import { DataTypes, Model } from 'sequelize'
import { User } from './user.js'

const documentSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    format: {
        //doc, docx, pdf, ppt, pptx, xls, xlsx
        type: DataTypes.STRING,
        allowNull: false
    },
    owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    url: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['owner_id','id', 'format']),
        allowNull: false,
        get() {
            return `/${this.getDataValue('owner_id')}/documents/${this.getDataValue('id')}.${this.getDataValue('format')}`
        }
    }
}
class Document extends Model {
    static associate(models) {
        this.belongsTo(models.User, {foreignKey: 'owner_id', onUpdate: 'cascade', onDelete: 'cascade', constraints: false})
    }
}

const pictureSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    format: {
        //jpg, png
        type: DataTypes.STRING,
        allowNull: false
    },
    owner_id: { 
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
            constraints: false
        }
    },
    url: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['owner_id','id', 'format']),
        allowNull: false,
        get() {
            return `/${this.getDataValue('owner_id')}/pictures/${this.getDataValue('id')}.${this.getDataValue('format')}`
        }
    }
}
class Picture extends Model {
    static associate(models) {
        this.belongsTo(models.User, {foreignKey: 'owner_id', onUpdate: 'cascade', onDelete: 'cascade'})
    }
}

function fileInit(sequelize) {
    Document.init(documentSchema, {
        sequelize,
        paranoid: true
    })
    Picture.init(pictureSchema, {
        sequelize,
        paranoid: true
    })
}

export {
    fileInit,
    Document,
    Picture
}