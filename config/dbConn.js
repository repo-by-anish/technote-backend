const mongoose = require("mongoose");


const connectDB = async () => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.DATABASE_URI)
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB