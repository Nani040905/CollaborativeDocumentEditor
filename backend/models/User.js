import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * MongoDB Mongoose Schema defining the system User database collection structure.
 * Features automated trimmed display names, strict email verification filters,
 * and encrypted password fields.
 */
const userSchema = new mongoose.Schema({
    // Display Name of the user, cleaned of leading/trailing spaces
    name: {
        type: String,
        required: [true, 'Name is a required field.'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters.']
    },
    // Login Email address, stored strictly in lowercase and unique-indexed
    email: {
        type: String,
        required: [true, 'Email is a required field.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please input a valid email address.'
        ]
    },
    // Secure hashed password string, with length restrictions enforced prior to encrypting
    password: {
        type: String,
        required: [true, 'Password is a required field.'],
        minlength: [6, 'Password must be at least 6 characters long.']
    }
}, {
    timestamps: true // Automatically generates and updates createdAt and updatedAt database records
});

/**
 * Mongoose Pre-Save Schema Hook:
 * Intercepts saving events to automatically hash plain-text user passwords using BCrypt.
 * Skips encrypting if the password field was not modified (e.g. on simple name updates).
 */
userSchema.pre('save', async function () {
    // Only execute if password is new or modified
    if (!this.isModified('password')) {
        return;
    }

    // Generate cryptographic salt iterations and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Custom Schema Method:
 * Compares an incoming plain-text login attempt password with the user's stored crypt-hash.
 * @param {string} enteredPassword - Plain password submitted in auth forms.
 * @returns {Promise<boolean>} True if match matches successfully.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
