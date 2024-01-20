import { DataTypes, Model } from 'sequelize'

const countrySchema = {
    id: {
        type: DataTypes.INTEGER,
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
        this.hasMany(models.User, { foreignKey: 'country_id' })
        this.hasMany(models.State, { foreignKey: 'country_id' })
    }
}

const stateSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    country_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Country,
            key: 'id'
        }
    }
}
class State extends Model {
    static associate(models) {
        this.hasMany(models.User, { foreignKey: 'state_id' })
    }
}

const sectionSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}
class Section extends Model {
    static associate(models) {
        this.hasMany(models.Participant, { foreignKey: 'section_id' })
    }
}

const occupationSchema = {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}
class Occupation extends Model {
    static associate(models) {
        this.hasMany(models.Participant, { foreignKey: 'occupation_id' })
    }
}

const instituteSchema = {
    id: {
        type: DataTypes.INTEGER,
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
        this.hasMany(models.Researcher, { foreignKey: 'institute_id' })
    }
}

const titleSchema = {
    id: {
        type: DataTypes.INTEGER,
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
        this.hasMany(models.Researcher, { foreignKey: 'title_id' })
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
    Section.init(sectionSchema, {
        sequelize, 
        timestamps: false,
        paranoid: true
    })
    Occupation.init(occupationSchema, {
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
    Section,
    Occupation,
    Institute,
    Title
}