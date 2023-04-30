require("dotenv").config();
require("express-async-errors")
const express= require('express');
const  mongoose=require('mongoose');
const cors=require("cors")
const corsOptions =require("./config/corsOptions")
const app=express();
const {logger,logEvent} = require('./middleware/logger')
const path=require('path');
const erroHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const connectDB=require("./config/dbConn");
const PORT=process.env.PORT||3500;

connectDB();

app.use(logger);
app.use(cors(corsOptions))


app.use('/',express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(cookieParser())

app.use('/',require('./routes/root'));

app.use("/auth",require("./routes/authRoutes"));
app.use("/users",require("./routes/userRoutes"));

app.use("/notes",require("./routes/noteRoutes"));

app.all('*',(req,res)=>{
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }else if(req.accepts('json')){
        res.json({
            message:'404 not found'
        });
    }else{
        res.type('txt').send('404 not found');
    }
})

app.use(erroHandler)

mongoose.connection.once("open",()=>{
    console.log("Connected to DB");
    app.listen(PORT,()=>console.log(`Listning on PORT:${PORT}`));
})

mongoose.connection.on("error",err=>{
    console.log(err);
    logEvent(`${err.no}:${err.code}\t${err.syscall}\t${err.hostname}`,"mongoErrLog.log");
})


