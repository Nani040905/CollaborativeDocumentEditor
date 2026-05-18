import mongoose from 'mongoose';

/**
 * Connects the backend Express server to the MongoDB cluster.
 * Uses environment variable `MONGO_URI` loaded via `dotenv`.
 * Configured with auto-indexing enabled for schema index builds in development.
 */
const connectDB = async () => {
    try {
        // Attempt connection using Mongoose ODM
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            autoIndex: true, // Auto-build indexes in development to maintain schema integrity
        });
        
        // Log connection parameters on success
        console.log(`[Database] MongoDB Connected Successfully to: ${conn.connection.host}`);
    } catch (error) {
        // Output failure signature to console log
        console.error(`[Database Error] Mongoose Connection Failure: ${error.message}`);
        // Exit active node process with failure status code (1) to trigger container/server restart
        process.exit(1);
    }
};

export default connectDB;
