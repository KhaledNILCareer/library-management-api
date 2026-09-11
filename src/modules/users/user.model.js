import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Please provide your name"]
    },
    email: {
        type: String,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/],
        trim: true,
        required: [true, "Please provide your email"],
        unique: true
    },
    password: {
        type: String,
        minlength: 6,
        required: [true, "Please provide your password"],
        select: false
    },
    role: {
        type: String,
        enum: ['Admin', 'Librarian', 'Member'],
        default: 'Member'
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);