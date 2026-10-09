import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 254,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    password:{
        type:String,
        required:true,
        select:false,
    },
    role:{
        type:String,
        enum:['student','recruiter'],
        required:true
    },
    profile:{
        bio:{type:String, default:"", maxlength:1000},
        skills:{type:[String], default:[]},
        resume:{type:String, default:""},
        resumeOriginalName:{type:String, default:""},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, 
        profilePhoto:{
            type:String,
            default:""
        }
    },
},{timestamps:true});

userSchema.set("toJSON", {
    transform: (_document, returned) => {
        delete returned.password;
        return returned;
    },
});

export const User = mongoose.model('User', userSchema);
export default User;
