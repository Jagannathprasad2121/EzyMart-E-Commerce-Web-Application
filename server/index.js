const dotenv = require('dotenv');
dotenv.config();
const app = require('./src/app')
const connectDB = require('./src/config/db')

connectDB()
.then(()=>{
    app.on("error", (error) => {
        console.log("ERROR: ",error)
        throw error
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running in port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!! ",err)
})