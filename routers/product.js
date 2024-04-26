const express = require('express') //importing the express object to be able to handle server requests.
const Product = require('../models/product.js') //importing the Product object using the product schema class I wrote.
const User = require('../models/user.js') //importing the User object using the user schema class I created.
const bcrypt  = require('bcrypt')//Importing a bcrypt object to be able to encrypt passwords.
const session = require('express-session')//creating a session function that will be used to create sessions.
const MongoStore = require('connect-mongo') //creating a mongostore variable to store the sessions in mongodb.
const authenticateUser = require('../middleware/authenticateUser')//importing middleware function
//creating a router object using express.
const router = express.Router()
/*
This is a post route that will create a new product and assign it to the user who was authenticated to get to the page.
*/
router.post('/products',authenticateUser,async (req,res)=>{
    //using a try catch to catch any errors that make it so the product cannot be created.
    try{
        //getting a reference to the product price
        const price = req.body.price
        //getting a reference to the product name
        const name = req.body.name
        //getting a reference to the owner of the new product which will be the buyer or user through the req object.
        const owner=req.user._id
        //creating a product using the parameters found and passed in through the request.
        const product = new Product ({name:name, price:price, owner:owner})
        //saving the product to the db and using async await to send the response back.
        const response =await product.save()
        //sending the response of the save.
        res.send(response)
    }catch(e){
        //sending an error message if the product could not be created.
        res.send({msg:"Product Could not be Created."})
    }
})

//This is a get route that will return an array list of all the products on the database.
router.get('/products',async(req,res)=>{
    //Calling a find query on the products and passing in no parameters so they are all returned.
    const result=await Product.find({})
    res.send(result)
})
/*
This is a post route that will authenticate a user and then allow a buyer to purchase an object using what is passed in through the request.
*/
router.post('/products/buy',authenticateUser,async(req,res)=>{
    //adding in a try catch to catch any possible exceptions so it will not just crash.
    try {
        //using async await to find a reference to the product passed in through the req object using the id.
        const product =await Product.findById(req.body.productID)
        //using async await to find a reference to the seller using the product's owner field.
        const seller = await User.findById(product.owner)
        //getting a reference to the buyer by using req.user that was passed in.
        const buyer = req.user
        //checking if the buyer's id is the same as the products owner and if they are then the buyer already owns it and a message will be sent.
        if(buyer._id.equals(product.owner)){
            //sending the message that the buyer already owns the item.
            res.send({msg:`Oops, ${buyer.name} already owns this item`})
        } else if(buyer.balance<product.price){ //checking to see if the buyer has enough money to buy the item.
            //sending back that the buyer did not have the funds to buy the item if the balance is less.
            res.send({msg:`Oops, ${buyer.name} has insufficient funds`})
        }else{
            //this means the transaction meets all the criteria and now the balances and ownership can be updated.
            //creating variables for the new balances by taking the old balances and adding or subtracting the price based on the seller or buyer.
            let sellerBalance=parseInt(seller.balance)+parseInt(product.price)
            let buyerBalance=parseInt(buyer.balance)-parseInt(product.price)
            //using findoneandupdate query on the product by using the id that was found earlier. Then changing the owner to now reference the buyer through the buyer_id.
            await Product.findOneAndUpdate({_id:product._id},{owner:buyer._id})
            //Using a find one and update query on the user class by using the buyer id found earlier then updating the balance value by using the buyerBalance variable calculated previously.
            await User.findOneAndUpdate({_id:buyer._id},{balance:buyerBalance})
            //Using another find one and update query on the user class by using the seller id found earllier then updating the balance value by using the sellerBalance variable calculated previously.
            await User.findOneAndUpdate({_id:seller._id},{balance:sellerBalance})
            //all of the updates were successful so now a response will be sent with the message that the transaction was successful.
            res.send({msg:'Transaction Successful!'})
        }
    } catch (error) {
        //catches any errors and sends a message.
        res.send({msg:"Transaction Unsuccessful"})
    }
})
/*
this is a delete route that will take in a product id as a parameter and delete that item. It uses authentication  middleware to authenticate the user
then it will check to make sure the user is the owner of the object and then delete it.
*/
router.delete('/products/:id',authenticateUser,async (req,res)=>{
    //calling a find by id and delete query on the product schema and passing in the id using req.params.id that was passed in and using async await.
    const response = await Product.findById(req.params.id)
    //if the response is null that means there is no product with that id.
    if(response===null){
        //sending a message that there is no product with the id passed in.
        res.send({"msg": "No product with the specified id."})
    }
    //if the user's id is equal to the owner of the item then the user owns the item and can delete it.
    if(req.user._id.equals(response.owner)){
        //using async await to delete the product using its id.
        const result = await Product.deleteMany({_id:response._id})
        //sending back the delete result.
        res.send(result)
    }else{
        //sending back that the user is not authorized to get rid of this item when their id is not equal to the owner's id.
        res.send({"msg": "You are not authorized to perform this operation"})
    }
})

//exporting this router so it can be used in the main app.js
module.exports = router