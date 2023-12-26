import { DataTypes } from 'sequelize'
import { User } from './user'
import { Research } from './research'
import { Tag } from './tags'

const cooperationGroupSchema = {
    status: {
        //0: pending, 1: accepted, 2: rejected
        type: DataTypes.ENUM('0', '1', '2'),
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
    Tag.belongsToMany(Research, { through: UserTag })

    const ResearchTag = sequelize.define('ResearchTag', researchTagSchema)
    Research.belongsToMany(Tag, { through: ResearchTag })
    Tag.belongsToMany(User, { through: ResearchTag })
}

export {
    joinInit
}