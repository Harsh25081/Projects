const express = require('express')
const mongoose = require('mongoose')
const route = require('./route/route')
const multer = require('multer')
const app = express()

app.use(express.json())
app.use(multer().any())



mongoose.connect("mongodb+srv://anurag:jhansi112233@my-cluster.cummqwt.mongodb.net/Project-5",{useNewUrlParser:true})
.then(()=>console.log("MongoDB is connected"))
.catch((err)=>console.log(err))

app.use('/',route)


app.use((req, res) => {
    res.status(404).send({ status: false, message: "Url not found" })
})


app.listen(process.env.PORT ||3000,function ()
{console.log("Express app is running on port "+(process.env.PORT ||3000))})