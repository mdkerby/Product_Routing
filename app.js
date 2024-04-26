const express = require('express') //imports the express object 
const path = require('path') //imports a path object.
const mongoose = require('mongoose') //imports the mongoose object.
const Product = require('./models/product.js') //Importing a product object based on the model product class that I wrote.
const User = require('./models/user.js') //Importing a user object based on the model user class that I wrote.
const bcrypt  = require('bcrypt')//Importing a bcrypt object to be able to encrypt passwords.
const session = require('express-session')//creating a session function that will be used to create sessions.
const MongoStore = require('connect-mongo') //creating a mongostore variable to store the sessions in mongodb.
const dotenv = require('dotenv') //importing the dotenv package
dotenv.config() //letting it configure and read the .env file.
//importing the routers for the user and product objets so that the routes can be used through the server even though they are in different files.
const userRouter = require('./routers/user.js')
const productRouter = require('./routers/product.js')
//getting a reference to an express variable that can be used to create routes.
const app = express()
//setting the server to the local server at port number 3000.
app.listen(process.env.PORT)
//Setting the server to use ejs and to be able to path through the views folder to find the ejs files
//although this project is through postman this is not really necessary.
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')
//setting up more paths and making sure the server.
//my url with the password and database I am trying to access.
const url = process.env.MONGO_URL
//middleware to help the program be able to run like the public path, and being able to encode/parse jsons.
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.json())
//using middleware to implement sessions using the mongostore and things like the topsecretkey. 
app.use(session({
    secret:process.env.SESSION_KEY,
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({mongoUrl:url})
}))
//importing the routers so that they can be accessed through the app object here.
app.use(userRouter)
app.use(productRouter)
//connecting to the database through mongoose.
mongoose.connect(url,(error,response)=>{
    if(error)
        console.log("Error connecting to db..")
    else
        console.log("Successfully connected to db..")
})
//This route will get a summary of all of the users and their items and send them as a response.
app.get('/summary',async(req,res)=>{
    //using a find query on the User schema to find all of the users and then populate the virtual items for each user.
    //using async await to store the response.
    const response =await User.find({}).populate('items')
    //sending the response.
    res.send(response)
})