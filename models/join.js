import { DataTypes } from 'sequelize'
import { User, Participant, Researcher } from './user.js'
import { Research, EassyQuestion, ChoiceQuestion } from './project.js'
import { Tag } from './tag.js'
import { Document, Picture } from './file.js'

const cooperationGroupSchema = {
    role: {
        //0: creator, 1: cooperater
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        //0: pending, 1: accepted, 2: rejected
        type: DataTypes.STRING,
        defaultvalue: '0',
        allowNull: false
    }
}

const researchTagSchema = {}

const participantTagSchema = {}

const researcherTagSchema = {}

const researchDocumentSchema = {}

const researchPictureSchema = {}

const participantResearchSchema = {}

const eassayAnswerSchema = {
    answer: {
        type: DataTypes.STRING,
        allowNull: false
    }
}

const choiceAnswerSchema = {
    answer: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}

function joinInit(sequelize) {
    const CooperationGroup = sequelize.define('CooperationGroup', cooperationGroupSchema)
    Research.belongsToMany(User, { through: CooperationGroup })
    User.belongsToMany(Research, { through: CooperationGroup })

    const ResearchTag = sequelize.define('ResearchTag', researchTagSchema)
    Research.belongsToMany(Tag, { through: ResearchTag })
    Tag.belongsToMany(Research, { through: ResearchTag })

    const ParticipantTag = sequelize.define('ParticipantTag',participantTagSchema)
    Participant.belongsToMany(Tag, { through: ParticipantTag })
    Tag.belongsToMany(Participant, { through: ParticipantTag })

    const ResearcherTag = sequelize.define('ResearcherTag', researcherTagSchema)
    Researcher.belongsToMany(Tag, { through: ResearcherTag })
    Tag.belongsToMany(Researcher, { through: ResearcherTag })

    const ResearchDocument = sequelize.define('ResearchDocument', researchDocumentSchema)
    Research.belongsToMany(Document, { through: ResearchDocument })
    Document.belongsToMany(Research, { through: ResearchDocument })

    const ResearchPicture = sequelize.define('ResearchPicture', researchPictureSchema)
    Research.belongsToMany(Picture, { through: ResearchPicture })
    Picture.belongsToMany(Research, { through: ResearchPicture })

    const ParticipantResearch = sequelize.define('ParticipantResearch', participantResearchSchema)
    Participant.belongsToMany(Research, { through: ParticipantResearch })
    Research.belongsToMany(Participant, { through: ParticipantResearch })

    const EassyAnswer = sequelize.define('EassyAnswer', eassayAnswerSchema)
    Participant.belongsToMany(EassyQuestion, { through: EassyAnswer })
    EassyQuestion.belongsToMany(Participant, { through: EassyAnswer })

    const ChoiceAnswer = sequelize.define('ChoiceAnswer', choiceAnswerSchema)
    Participant.belongsToMany(ChoiceQuestion, { through: ChoiceAnswer })
    ChoiceQuestion.belongsToMany(Participant, { through: ChoiceAnswer })
}

export {
    joinInit
}