const {logEvent} =require('./logger');

const erroHandle =(err,req,res,next)=>{
 logEvent(`${err.name}\t${err.message}\t${req.method},\t${req.url}\t${req.headers.origin}`,'errLog.log')
 console.log(err.stack);

 const status = res.statusCode?res.statusCode:500 //server Error

 res.status(status);

 res.json({message: err.message, isError: true});

}


module.exports = erroHandle

