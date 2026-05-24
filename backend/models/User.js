import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * MongoDB Mongoose Schema defining the system User database collection structure.
 * Features automated trimmed display names, strict email verification filters,
 * and encrypted password fields. This model handles all authentication-related
 * storage and verification mechanics.
 * 
 * @module UserSchema
 */
const userSchema = new mongoose.Schema({
    // Display Name of the user
    // Required for UI rendering (e.g. avatar initials, dashboard greetings)
    // Trimmed to prevent leading/trailing whitespace issues in database
    name: {
        type: String,
        required: [true, 'Name is a required field.'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters.'] // Prevent malicious long string inputs
    },
    // Login Email address
    // Acts as the primary unique identifier for login mechanisms
    // Stored strictly in lowercase to ensure case-insensitive login matching
    email: {
        type: String,
        required: [true, 'Email is a required field.'],
        unique: true, // Creates a MongoDB unique index to prevent duplicate accounts
        trim: true,
        lowercase: true,
        // Regex match ensures format compliance before attempting database insertion
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please input a valid email address.'
        ]
    },
    // Secure hashed password string
    // Stored as a BCrypt hash, never plain text, to prevent data breach exposures
    password: {
        type: String,
        required: [true, 'Password is a required field.'],
        // Length restriction enforced on the plain text before the pre-save hook hashes it
        minlength: [6, 'Password must be at least 6 characters long.']
    }
}, {
    // Automatically generates and updates `createdAt` and `updatedAt` Date records
    // Useful for tracking account creation times and last modified times
    timestamps: true 
});

/**
 * Mongoose Pre-Save Schema Hook:
 * Intercepts saving events to automatically hash plain-text user passwords using BCrypt.
 * Skips encrypting if the password field was not modified (e.g. on simple profile updates).
 * 
 * @param {Function} next - Mongoose middleware next() callback
 */
userSchema.pre('save', async function (next) {
    // Only execute hashing if the password field is new or explicitly modified
    // This prevents re-hashing an already hashed password during standard user updates (like changing name)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate cryptographic salt with 10 iterations
        // 10 is standard for balancing security vs computation time
        const salt = await bcrypt.genSalt(10);
        // Hash the plain-text password with the generated salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Custom Schema Instance Method:
 * Compares an incoming plain-text login attempt password with the user's stored BCrypt hash.
 * This function handles the complex timing-safe cryptographic comparison.
 * 
 * @param {string} enteredPassword - Plain password submitted in auth forms.
 * @returns {Promise<boolean>} True if match matches successfully, false otherwise.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Uses BCrypt's compare function to safely check the hash
    return await bcrypt.compare(enteredPassword, this.password);
};

// Compile and export the User model from the schema
const User = mongoose.model('User', userSchema);
export default User;
