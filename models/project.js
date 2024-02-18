import { DataTypes, Model } from 'sequelize'

const researchSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    headCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reward: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        //0: draft, 1: in progress, 2: closed
        type: DataTypes.STRING,
        allowNull: false
    },
    appointment_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    questionnaire_id: {
        type: DataTypes.UUID,
        allowNull: true
    }
}

const appointmentSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    }, 
    endTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    meetingInfo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    }
}

const questionnaireSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    dueTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    timeLimit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    essayNumber:  {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    choiceNumber: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}

const eassyQuestionSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    question: {
        type: DataTypes.STRING,
        allowNull: false
    },
    questionnaire_id: {
        type: DataTypes.UUID,
        allowNull: false
    }
}

const choiceQuestionSchema = {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    number: {  
        type: DataTypes.INTEGER,
        allowNull: false
    },
    question: {
        type: DataTypes.STRING,
        allowNull: false
    },
    options: {
        type: DataTypes.STRING,
        allowNull: false
    },
    choice:  {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    questionnaire_id: {
        type: DataTypes.UUID,
        allowNull: false
    }
}
class Research extends Model {
    static associate(models) {
        this.belongsTo(models.User, {foreignKey: 'user_id', onUpdate: 'cascade', onDelete: 'restrict'})
        this.hasOne(models.Appointment, {foreignKey: 'research_id', onUpdate: 'cascade', onDelete: 'cascade'})
        this.hasOne(models.Questionnaire, {foreignKey: 'research_id', onUpdate: 'cascade', onDelete: 'cascade'})
    }
}
class Appointment extends Model {
    static associate(models) {
        this.belongsTo(models.Research, {foreignKey: 'research_id', onUpdate: 'cascade', onDelete: 'cascade'})
    }
}
class Questionnaire extends Model {
    static associate(models) {
        this.belongsTo(models.Research, {foreignKey: 'research_id', onUpdate: 'cascade', onDelete: 'cascade'})
    }
}
class EassyQuestion extends Model {
    static associate(models) {
        this.belongsTo(models.Questionnaire, {foreignKey: 'questionnaire_id', onUpdate: 'cascade', onDelete: 'cascade'})
    }
}
class ChoiceQuestion extends Model {
    static associate(models) {
        this.belongsTo(models.Questionnaire, {foreignKey: 'questionnaire_id', onUpdate: 'cascade', onDelete: 'cascade'})
    }
}

function projectInit(sequelize) {
    Research.init(researchSchema, {
        sequelize,
        paranoid: true
    })
    Appointment.init(appointmentSchema, {
        sequelize,
        paranoid: true
    })
    Questionnaire.init(questionnaireSchema, {
        sequelize,
        paranoid: true
    })
    EassyQuestion.init(eassyQuestionSchema, {
        sequelize,
        paranoid: true
    })
    ChoiceQuestion.init(choiceQuestionSchema, {
        sequelize,
        paranoid: true
    })
}

export { 
    projectInit,
    Research, 
    Appointment, 
    Questionnaire, 
    EassyQuestion, 
    ChoiceQuestion 
}
