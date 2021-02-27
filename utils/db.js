const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true,
            useCreateIndex: true
        })

        console.log(`MongoDB connected: ${conn.connection.host}`)

    } catch (error) {
        console.error("Unable to connect to the database")
        process.exit(1)
    }
}

module.exports = connectDB