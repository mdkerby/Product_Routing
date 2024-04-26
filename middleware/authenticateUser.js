const User = require('../models/user') //importing the model
/*
This is a middleware function that is asynchronous and will be used to authenticate users. ON routes where 
authenitication is necessary this will be called as middleware, it will check for a valid id and then if it is valid it will query for the user and 
pass it in the req object and then call next to continue the function or route.
*/
async function authenticateUser(req,res,next){
    //checking if the current session has a valid user id and if it does not a fail message will be sent.
    if(!req.session.user_id){
        //sending the message that the page requires you to be logged in.
        res.send({"msg": "This page requires you to be logged in"})
    }
    //using async await and the find by id query to get a reference to the user.
    const user = await User.findById(req.session.user_id)
    //passing the user to the function by making req.user reference the user found with the session id.
    req.user = user
    //calling next to keep going to the function because it was a successful authentication.
    next()
}
//exporting the function.
module.exports=authenticateUser