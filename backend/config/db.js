import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: true, // Auto-build indexes in development
        });
        
        console.log(`[Database] MongoDB Connected Successfully to: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Database Error] Mongoose Connection Failure: ${error.message}`);
        // Exit process with failure code
        process.exit(1);
    }
};

export default connectDB;
