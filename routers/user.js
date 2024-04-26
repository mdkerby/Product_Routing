const express = require('express') //imports the express object
const Product = require('../models/product.js')//imports the product model
const User = require('../models/user.js') //imports the User model
const router = express.Router()//creates a router object that can be exported later.
const bcrypt  = require('bcrypt')//Importing a bcrypt object to be able to encrypt passwords.
const session = require('express-session')//creating a session function that will be used to create sessions.
const MongoStore = require('connect-mongo') //creating a mongostore variable to store the sessions in mongodb.
const authenticateUser = require('../middleware/authenticateUser')//importing middleware function
/*
This is a delete route that will first authenticate a user and then it will attempt to delete the user, all of their products and destroy their session.
Then it will send back a success message or fail depending on if it succeeded.
*/
router.delete('/users/me',authenticateUser,async(req,res)=>{
    //using a try catch to catch errors when deleting.
    try {
        //using async await to delete all of the products that have the user as the owner.
        await Product.deleteMany({owner:req.user._id})
        //using async await to delete the user that was passed in through the request authentication.
        await User.findByIdAndDelete(req.user._id)
        //using async await to destroy the current session.
        await req.session.destroy()
        //send a successful message to the user that they were deleted.
        res.send({msg: "Successfully deleted "+req.user.name})
    } catch (error) {
        //if there is any error send a message back that the user could not be deleted.
        res.send({msg:"Could not delete current user."})
    }
})
/*
This is a get route that will first authenticate the user and then will return all of the details about a user and their items except the password.
It will then send the result 
*/
//this is a get route that will take in a username as a parameter in the url and return a detailed response based on the user.
router.get('/users/me',authenticateUser,async(req,res)=>{
    //using a find one query on the User schema and then using the username from authentication as the search parameter.
    //also using .populate so that the items array with all of the users items will be sent in the response.
    //made it into an async await as well.
    let result= await User.findOne({user_name:req.user.user_name},{password:0}).populate('items')
    //sending the result of the find query so that the user can see their details.
    res.send(result)
})
/*
    This is a post route that will logout the current user that is logged into their session. First it authenticates a user then uses the 
    destroy method to destroy the session.
*/
router.post('/users/logout',authenticateUser,async (req,res)=>{
    //using async await and the destroy method to destroy the current session that made the request.
    await req.session.destroy()
    //sending a successful message that the user has logged out.
    res.send({msg: "Successfully logged out "+req.user.name})
})
/*
This is a post login route that will take in info from the req.body and try to login the user based on the info.
*/
router.post('/users/login',async (req,res)=>{
    //using async await to find the user that corresponds with the username passed in the body.
    const user = await User.findOne({user_name:req.body.user_name})
    //checking if the user is null meaning the username was not correct or doesnt exist.
    if(!user){
        //sending an error message that the login was wrong.
        res.send({msg: "Error logging in. Incorrect username/password"})
    }
    //using async await to compare the password that was passed in through the body and the hashed password from the db using the bcrypt.compare method.
    const isMatch = await bcrypt.compare(req.body.password,user.password)
    //making sure there was a match of the passwords.
    if(!isMatch){
        //sending an error message that the login was wrong.
        res.send({msg: "Error logging in. Incorrect username/password"})
    }
    //linking the session id with the users ID now that the login has worked and is correct.
    req.session.user_id = user._id
    //sending a success message that the login was correct with the username included.
    res.send({msg: "Successfully logged in. Welcome "+user.name})
})
/*
This is a post route that will take in user info and register a new user. It will also create a session and hash the password for security reasons.
*/
router.post('/users/register',async (req,res)=>{
    //creating a new user using the info passed into the req.body
    try{
        //getting a reference to the username that was passed in through the body.
        const user_name = req.body.user_name
        //getting a reference to the password and using async await to hash the password so it can be stored on the db.
        const password = await bcrypt.hash(req.body.password,8)
        //getting a reference to the name that was passed in through the body.
        const name = req.body.name
        //creating a user using the info just extracted from the body and hashing.
        const user = new User ({name:name, user_name:user_name, password:password})
        //saving the user using async await and storing the response in a variable.

        const response =await user.save()
        //creating a new session for the user using their id.
        req.session.user_id = user._id
        //sending the response from the save.
        res.send(response)
    }catch(e){
        //sending an error that the user could not be created if any errors occured.
        res.send({msg:"User Could not be Created."})
    }
    //sending the response that the user was saved because it was successful.
})
//exporting the router so it can be used in the app.js
module.exports = router