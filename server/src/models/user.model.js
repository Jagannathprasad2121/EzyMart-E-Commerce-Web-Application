const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required for creating a user"],
        trim: true,
        lowercase: true,
        unique: [true, "Email already exist"],
        match: [ /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Invalid email address"]
    },
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6,"Password should be minimum 6 character"],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    verified: {
        type: Boolean,
        default: false
    }
},{timestamps: true});

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")){
        return
    }
    const hash = await bcrypt.hash(this.password,10)
    this.password = hash
    return
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}



module.exports = mongoose.model("User",userSchema)