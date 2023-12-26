import { DataTypes, Model } from 'sequelize'

const documentSchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    format: {
        type: DataTypes.ENUM('doc', 'docx', 'pdf', 'ppt', 'pptx', 'xls', 'xlsx'),
        allowNull: false
    },
    owner: {
        type: DataTypes.ENUM('user', 'research'),
        allowNull: false
    },
    owner_id: { 
        type: DataTypes.UUIDV4,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
            onUpdate: 'cascade',
            onDelete: 'restrict'
        }
    },
    url: {
        type: DataTypes.DataTypes.VIRTUAL(DataTypes.STRING, ['research_id','id', 'format']),
        allowNull: false,
        get() {
            return `/${this.getDataValue('owner')}/${this.getDataValue('owner_id')}/documents/${this.getDataValue('id')}.${this.getDataValue('format')}`
        }
    }
}
class Document extends Model {
    static associate(models) {
        this.belongsTo(models.Research, {foreignKey: 'research_id', onUpdate: 'cascade', onDelete: 'cascade'})
    }
}

const pictureSchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    format: {
        type: DataTypes.ENUM('jpg', 'png', 'gif'),
        allowNull: false
    },
    owner: {
        type: DataTypes.ENUM('user', 'research'),
        allowNull: false
    },
    owner_id: { 
        type: DataTypes.UUIDV4,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id',
            onUpdate: 'cascade',
            onDelete: 'restrict'
        }
    },
    url: {
        type: DataTypes.DataTypes.VIRTUAL(DataTypes.STRING, ['research_id','id', 'format']),
        allowNull: false,
        get() {
            return `/${this.getDataValue('owner')}/${this.getDataValue('owner_id')}/pictures/${this.getDataValue('id')}.${this.getDataValue('format')}`
        }
    }
}
class Picture extends Model {
    static associate(models) {
        this.belongsTo(models.Research, {foreignKey: 'research_id', onUpdate: 'cascade', onDelete: 'cascade'})
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