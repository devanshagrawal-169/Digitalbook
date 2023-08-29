const mongoose= require('mongoose');

const mongoURI = "mongodb://127.0.0.1:27017/Digitalbook"

const connectToMongo=()=>{
    mongoose.connect(mongoURI);
    console.log("Connected To Mongo");
}
module.exports = connectToMongo;

