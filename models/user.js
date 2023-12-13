import { DataTypes, Model } from 'sequelize'

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

class User extends Model {}
class Participant extends Model {}
class Researcher extends Model {}

function init(mysql) {
    User.init(
        userSchema,
        {
            mysql,
            modelName : 'Users'
        }
    )
    Participant.init(
        participantSchema,
        {
            mysql,
            modelName : 'Participants'
        }
    )
    Researcher.init(
        researcherSchema,
        {
            mysql,
            modelName : 'Researchers'
        }
    )
}


export default {
    init,
    User,
    Participant,
    Researcher
}
