const mongoose = require('mongoose')

const validator = require('validator')
const bcrypt = require('bcryptjs')
const { match } = require('assert')
const { exists } = require('fs')

const Schema = mongoose.Schema

const userSchema = new Schema({
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true,
    },
    Role: {
        type: String,
        required: true,
        enum: ['customer', 'seller']
    }
}, {timestamps: true})

userSchema.statics.signup = async function(Email, Password, Role) {
    if (!Email || !Password || !Role) {
        throw new Error('All fields must be filled')
    }

    if(!validator.isEmail(Email)){
        throw new Error('Invalid Email')
    }

    if(!validator.isStrongPassword(Password)){
        throw Error('Password is not strong enough.')
    }

    const exists = await this.findOne({Email})

    if(exists) {
        throw Error('Email is already in use.')        
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(Password, salt)

    const user = await this.create({Email, Password: hash, Role})

    return user
}

userSchema.statics.login = async function(Email, Password) {
    if(!Email || !Password) {
        throw Error('All fields must be filled.')
    }

    const user = await this.findOne({Email})

    if(!user){
        throw Error('Incorrect Email')
    }

    const match = await bcrypt.compare(Password, user.Password)

    if(!match) {
        throw Error('Incoorect Password, please provide valid credentials.')
    }

    return user
}

module.exports = mongoose.model('TempUser', userSchema)