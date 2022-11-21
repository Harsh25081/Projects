const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const internSchema = new mongoose.Schema(
{
        name :{
        type:String,
        required : true,
        trim : true
        },
        email : {
        type : String,
        unique : true
        },
        mobile : {
        type : Number,
        unique : true
        },
        collegeId : {
        type : ObjectId,
        ref : "College"
        },
        isDeleted : {
        type : Boolean,
        default : false
        }
    },{timestamps : true})
    module.exports = mongoose.model( "Intern", internSchema)