import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is a required field.'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters.']
    },
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
    password: {
        type: String,
        required: [true, 'Password is a required field.'],
        minlength: [6, 'Password must be at least 6 characters long.']
    }
}, {
    timestamps: true // Automatically generates createdAt and updatedAt columns
});

// Middleware hook: Hash password prior to save
userSchema.pre('save', async function () {
    // Only execute if password is new or modified
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance Method: Compare input password against database hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
