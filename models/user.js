import { DataTypes, Model } from 'sequelize'

const userSchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        //0:participant, 1:researcher
        type: DataTypes.ENUM('0', '1'),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {  
        type: DataTypes.STRING,
        allowNull: false
    },
    fullName: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['firstName', 'lastName']),
        get() {
            return `${this.getDataValue('firstName')} ${this.getDataValue('lastName')}`
        }
    },
    sex: {
        type: DataTypes.ENUM('female', 'male', 'nb'),
        allowNull: false
    },
    birth: {
        type: DataTypes.DATE,
        allowNull: false
    },
    country_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Country',
            key: 'id'
        }
    },
    state_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'State',
            key: 'id'
        }
    }
}

const participantSchema = {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    industry_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Industry',
            key: 'id',
            onUpdate: 'cascade',
            onDelete: 'restrict'
        }
    },
    position_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Position',
            key: 'id',
            onUpdate: 'cascade',
            onDelete: 'restrict'
        }
    },
    description: {
        type: DataTypes.STRING
    }
}

const researcherSchema = {
    id: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
        primaryKey: true
    },
    institute_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Institute',
            key: 'id',
            onUpdate: 'cascade',
            onDelete: 'restrict'
        }
    },
    title_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'Title',
            key: 'id',
            onUpdate: 'cascade',
            onDelete: 'restrict'
        }
    },
    description: {
        type: DataTypes.STRING
    }
}

class User extends Model {
    static associate(models) {
        this.hasOne(models.Participant, {foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'cascade'})
        this.hasOne(models.Researcher, {foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'cascade'})
    }
}
class Participant extends Model {
    static associate(models) {
        this.belongsTo(models.User, {foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'cascade'})
        this.hasMany(models.Document, {foreignKey: 'owner_id', onUpdate: 'cascade', onDelete: 'cascade'})
        this.hasMany(models.Picture, {foreignKey: 'owner_id', onUpdate: 'cascade', onDelete: 'cascade'})
        this.hasOne(models.Picture, {as: 'Avatar', constraints: false, foreignKey: 'owner_id', onUpdate: 'cascade', onDelete: 'cascade'})
    }
}
class Researcher extends Model {
    static associate(models) {
        this.belongsTo(models.User, {foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'cascade'})
        this.hasOne(models.Avatar, {foreignKey: 'owner_id', onUpdate: 'cascade', onDelete: 'restrict'})
    }
}

function userInit(sequelize) {
    User.init(userSchema,{
        sequelize,
        paranoid: true
    })
    Participant.init(participantSchema, {
        sequelize,
        paranoid: true
    })
    Researcher.init(researcherSchema, {
        sequelize,
        paranoid: true
    })
}

export {
    userInit,
    User,
    Participant,
    Researcher
}
