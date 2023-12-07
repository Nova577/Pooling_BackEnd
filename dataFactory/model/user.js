import {DataTypes} from 'sequelize'
import DataFactory from '../dataFactory'

const dataFactory = DataFactory.getInstance()
const mysql = dataFactory.getDatabase('mysql')

const userSchema = {
    id : {
        type : DataTypes.STRING,
        allowNull : false,
        unique : true,
        primaryKey : true
    },
    type : {
        type : DataTypes.ENUM('0', '1'),
        allowNull : false
    },
    email : {
        type : DataTypes.STRING,
        allowNull : false,
        unique : true,
        validate : {

        }
    },
    passwordHash : {
        type : DataTypes.STRING,
        allowNull : false,
        validate : {

        }
    },
    name : {
        type : DataTypes.STRING,
        allowNull : false,
        validate : {

        }
    },
    sex : {
        type : DataTypes.ENUM('female', 'male', 'other'),
        allowNull : false,
    },
    birth : {
        type : DataTypes.STRING,
        allowNull : false,
        validate : {

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
    avatar : {
        type : DataTypes.STRING,
        unique : true,
        allowNull : false
    },
    description : {
        type : DataTypes.STRING
    }
}

const participantInfoSchema = {
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
        references : 'User'
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
        type : DataTypes.STRING,
        validate : {

        }
    },
    medicalHistory : {
        type : DataTypes.STRING,
        validator : {

        }
    },
    other : {
        type : DataTypes.STRING,
        validate : {

        }
    }
}

const researcherInfoSchema = {
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
        references : 'User'
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
        type : DataTypes.STRING,
        validate : {

        }
    },
    medicalHistory : {
        type : DataTypes.STRING,
        validator : {

        }
    },
    other : {
        type : DataTypes.STRING,
        validate : {

        }
    }
}

const User = mysql.define('User', userSchema)
const ParticipantInfo = mysql.define('ParticipantInfo', participantInfoSchema)
const ResearcherInfo = mysql.define('ResearcherInfoSchema', researcherInfoSchema)

export default {
    User,
    ParticipantInfo,
    ResearcherInfo
}
