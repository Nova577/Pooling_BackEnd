import { DataTypes, Model } from 'sequelize'

const userSchema = {
    id : {
        type : DataTypes.STRING,
        allowNull : false,
        unique : true,
        primaryKey : true
    },
    //0:participant, 1:researcher
    type : {
        type : DataTypes.ENUM('0', '1'),
        allowNull : false
    },
    email : {
        type : DataTypes.STRING,
        allowNull : false,
        unique : true
    },
    passwordHash : {
        type : DataTypes.STRING,
        allowNull : false
    },
    name : {
        type : DataTypes.STRING,
        allowNull : false
    },
    sex : {
        type : DataTypes.ENUM('female', 'male', 'other'),
        allowNull : false
    },
    birth : {
        type : DataTypes.STRING,
        allowNull : false
    }
}

const participantSchema = {
    id : {
        type : DataTypes.STRING,
        allowNull : false,
        unique : true,
        primaryKey : true
    },
    userId : {
        type : DataTypes.STRING,
        allowNull :false,
        unique : true,
        references : {
            model: 'User',
            key: 'id'
        }
    },
    country : {
        type : DataTypes.STRING,
        allowNull : false
    },
    state : {
        type : DataTypes.STRING,
        allowNull : false
    },
    industry : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    position : {
        type : DataTypes.STRING,
        allowNull : false
    },
    pets : {
        type : DataTypes.STRING
    },
    medicalHistory : {
        type : DataTypes.STRING
    },
    other : {
        type : DataTypes.STRING
    },
    avatar : {
        type : DataTypes.STRING,
        unique : true,
        allowNull : true
    },
    description : {
        type : DataTypes.STRING
    }
}

const researcherSchema = {
    id : {
        type : DataTypes.STRING,
        allowNull : false,
        unique : true,
        primaryKey : true
    },
    userId : {
        type : DataTypes.STRING,
        allowNull :false,
        unique : true,
        references : {
            model: 'User',
            key: 'id'
        }
    },
    country : {
        type : DataTypes.STRING,
        allowNull : false
    },
    state : {
        type : DataTypes.STRING,
        allowNull : false
    },
    institute : {
        type : DataTypes.STRING,
        allowNull : false
    },
    title : {
        type : DataTypes.STRING,
        allowNull : false
    },
    fields : {
        type : DataTypes.STRING
    },
    links : {
        type : DataTypes.STRING
    },
    other : {
        type : DataTypes.STRING
    },
    avatar : {
        type : DataTypes.STRING,
        unique : true,
        allowNull : true
    },
    description : {
        type : DataTypes.STRING
    }
}

class User extends Model {
    static associate(models) {
        User.hasOne(models.Participant, { onDelete : 'cascade' })
        User.hasOne(models.Researcher, { onDelete : 'cascade' })
    }
}
class Participant extends Model {}
class Researcher extends Model {}

function userInit(sequelize) {
    User.init(userSchema,{
        sequelize,
        modelName: 'User'
    }
    )
    Participant.init(participantSchema, {
        sequelize,
        modelName: 'Participant'
    })
    Researcher.init(researcherSchema, {
        sequelize,
        modelName: 'Researcher'
    })
}


export {
    userInit,
    User,
    Participant,
    Researcher
}
