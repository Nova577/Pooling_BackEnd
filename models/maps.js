import { DataTypes, Model } from 'sequelize'

const countrySchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}
class Country extends Model { 
    static associate(models) {
        this.hasOne(models.User, { foreignKey: 'country_id' })
        this.hasMany(models.State, { foreignKey: 'country_id' })
    }
}

const stateSchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}
class State extends Model {
    static associate(models) {
        this.hasOne(models.User, { foreignKey: 'state_id' })
    }
}

const industrySchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}
class Industry extends Model { 
    static associate(models) {
        this.hasOne(models.Participant, { foreignKey: 'industry_id' })
        this.hasMany(models.position, { foreignKey: 'industry_id' })
    }
}

const positionSchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}
class Position extends Model {
    static associate(models) {
        this.hasOne(models.Participant, { foreignKey: 'position_id' })
    }
}

const instituteSchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}
class Institute extends Model {
    static associate(models) {
        this.hasOne(models.Researcher, { foreignKey: 'institute_id' })
        this.hasMany(models.Title, { foreignKey: 'institute_id' })
    }
}

const titleSchema = {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}
class Title extends Model {
    static associate(models) {
        this.hasOne(models.Researcher, { foreignKey: 'title_id' })
    }
}

function mapInit(sequelize) {
    Country.init(countrySchema, { 
        sequelize, 
        timestamps: false,
        paranoid: true
    })
    State.init(stateSchema, { 
        sequelize, 
        timestamps: false,
        paranoid: true
    })
    Industry.init(industrySchema, { 
        sequelize, 
        timestamps: false,
        paranoid: true
    })
    Position.init(positionSchema, { 
        sequelize, 
        timestamps: false,
        paranoid: true
    })
    Institute.init(instituteSchema, { 
        sequelize, 
        timestamps: false,
        paranoid: true 
    })
    Title.init(titleSchema, { 
        sequelize,
        timestamps: false,
        paranoid: true
    })
}

export {
    mapInit,
    Country,
    State,
    Industry,
    Position,
    Institute,
    Title
}