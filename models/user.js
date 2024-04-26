const mongoose = require('mongoose') //importing mongoose 
//creating a user schema through mongoose and creating three fields.
const UserSchema  = mongoose.Schema({
    //a name field that is a required string.
    name:{type:String, required:true},
    //a username field that is a required string. 
    user_name:{type:String, required:true, unique:true},
    //a balance field that is a number and if not entered will default to 100.
    balance:{type:Number, default:100},
    //a password field that will be used for authentication.
    password:{type:String, required:true}
})
//creating a virtual field called items that will be stored by the user.
UserSchema.virtual('items',{
    //the reference list is product
    ref:'Product',
    //the localField to reference is the id.
    localField: '_id',
    //the foreign field on the products is called owner.
    foreignField: 'owner'
})
//syntax to help set the userschema to be able to convert between json and objects.
UserSchema.set('toJSON',{virtuals:true})
UserSchema.set('toObject',{virtuals:true})
//Getting a user reference to export by using mongoose.model and passing in the name, schema, and database name
const User = mongoose.model('User',UserSchema,'users')
//exporting the User object.
module.exports = User