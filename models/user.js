import { DataTypes, Model } from 'sequelize'
import { Country, State, Section, Occupation, Institute, Title } from './maps.js'

const userSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        //0: participant, 1: researcher
        type: DataTypes.STRING,
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
        //0: female, 1: male, 2: non-binary
        type: DataTypes.STRING,
        allowNull: false
    },
    birth: {
        type: DataTypes.DATE,
        allowNull: false
    },
    country_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Country,
            key: 'id'
        }
    },
    state_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: State,
            key: 'id'
        }
    }
}
class User extends Model {
    static associate(models) {
        this.hasMany(models.Picture, {foreignKey: 'owner_id'})
        this.hasOne(models.Picture, {as: 'Avatar', constraints: false, foreignKey: 'owner_id'})
        this.hasMany(models.Document, {foreignKey: 'owner_id'})
        this.hasOne(models.Participant, {foreignKey: 'user_id'})
        this.hasOne(models.Researcher, {foreignKey: 'user_id'})
    }
}

const participantSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Section,
            key: 'id'
        }
    },
    occupation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Occupation,
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    description: {
        type: DataTypes.STRING,
        defaultValue: ''
    }
}
class Participant extends Model {
    static associate(models) {
        this.belongsTo(models.User, {foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'restrict'})
    }
}

const researcherSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    institute_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Institute,
            key: 'id'
        }
    },
    title_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Title,
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    relatedLinks: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        defaultValue: ''
    }
}
class Researcher extends Model {
    static associate(models) {
        this.belongsTo(models.User, {foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'restrict'})
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
