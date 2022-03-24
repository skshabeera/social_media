const mongoose=require('mongoose');
const config=require('config');
const db="mongodb+srv://shabeera:Shabeera@devconnector.qruu4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const connectDB=async()=>{
    try{
        await mongoose.connect(db,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log(`mongoDB connected.............`)
    }
    catch (err){
        console.error(err.message);
        process.exit(1);
    }
}
module.exports=connectDB