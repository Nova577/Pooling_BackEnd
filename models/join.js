import { DataTypes } from 'sequelize'
import { User } from './user.js'
import { Research } from './project.js'
import { Tag } from './tag.js'

const cooperationGroupSchema = {
    status: {
        //0: pending, 1: accepted, 2: rejected
        type: DataTypes.STRING,
        defaultvalue: '0',
        allowNull: false
    }
}

const userTagSchema = {}

const researchTagSchema = {}

function joinInit(sequelize) {
    const CooperationGroup = sequelize.define('CooperationGroup', cooperationGroupSchema)
    Research.belongsToMany(User, { through: CooperationGroup })
    User.belongsToMany(Research, { through: CooperationGroup })

    const UserTag = sequelize.define('UserTag', userTagSchema)
    User.belongsToMany(Tag, { through: UserTag })
    Tag.belongsToMany(User, { through: UserTag })

    const ResearchTag = sequelize.define('ResearchTag', researchTagSchema)
    Research.belongsToMany(Tag, { through: ResearchTag })
    Tag.belongsToMany(Research, { through: ResearchTag })
}

export {
    joinInit
}