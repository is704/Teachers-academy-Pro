const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['student', 'instructor', 'admin'],
        default: 'student'
    },
    learningGoals: {
        speaking: { type: Boolean, default: false },
        listening: { type: Boolean, default: false },
        writing: { type: Boolean, default: false },
        reading: { type: Boolean, default: false }
    },
    subscription: {
        type: {
            type: String,
            enum: ['free', 'premium', 'gold'],
            default: 'free'
        },
        startDate: Date,
        endDate: Date,
        autoRenew: { type: Boolean, default: false }
    },
    progress: {
        completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
        currentCourses: [{
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
            progress: { type: Number, default: 0 }, // نسبة الإنجاز
            lastAccessed: Date
        }],
        totalStudyTime: { type: Number, default: 0 } // بالدقائق
    },
    profile: {
        avatar: String,
        bio: String,
        phone: String,
        country: String,
        languageLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'native'],
            default: 'beginner'
        }
    },
    settings: {
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true },
        language: { type: String, default: 'ar' },
        timezone: { type: String, default: 'Africa/Casablanca' }
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// إنشاء token للمصادقة
userSchema.methods.generateAuthToken = function() {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
        { id: this._id, email: this.email, role: this.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

module.exports = mongoose.model('User', userSchema);
