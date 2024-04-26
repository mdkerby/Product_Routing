const mongoose = require('mongoose') //importing mongoose
//creating a product schema through mongoose that will have the fields for a product.
const ProductSchema  = mongoose.Schema({
    //creating a name field that is a required string.
    name:{type:String, required:true},
    //creating a price field that is a required number.
    price:{type:Number, required:true},
    //creating an owner field that is a type of ObjectID, what is used on mongoose, and having the ref be the User type.
    owner:{type:mongoose.Schema.Types.ObjectId,ref:'User'}
})
//syntax to let the schema switch between json and objects seamlessly.
ProductSchema.set('toJSON',{virtuals:true})
ProductSchema.set('toObject',{virtuals:true})
//creating a product object using mongoose.model and passing in the name of the Product list, variable, and the schema itself.
const Product = mongoose.model('Product',ProductSchema,'products')
//exporting the Product object to be used throughout the project.
module.exports = Product