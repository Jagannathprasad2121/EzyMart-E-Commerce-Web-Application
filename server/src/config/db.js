const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongooDB conected !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error("ERROR: ",error)
        throw error
    }
}

module.exports = connectDB