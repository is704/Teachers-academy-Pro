const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    // المعلومات الأساسية
    firstName: {
        type: String,
        required: [true, 'الاسم الأول مطلوب'],
        trim: true,
        minlength: [2, 'الاسم الأول يجب أن يكون على الأقل حرفين'],
        maxlength: [50, 'الاسم الأول يجب أن لا يتجاوز 50 حرفاً']
    },
    
    lastName: {
        type: String,
        required: [true, 'اسم العائلة مطلوب'],
        trim: true,
        minlength: [2, 'اسم العائلة يجب أن يكون على الأقل حرفين'],
        maxlength: [50, 'اسم العائلة يجب أن لا يتجاوز 50 حرفاً']
    },
    
    email: {
        type: String,
        required: [true, 'البريد الإلكتروني مطلوب'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'البريد الإلكتروني غير صحيح']
    },
    
    password: {
        type: String,
        required: [true, 'كلمة المرور مطلوبة'],
        minlength: [6, 'كلمة المرور يجب أن تكون على الأقل 6 أحرف'],
        select: false
    },
    
    // المعلومات الإضافية
    phone: {
        type: String,
        trim: true,
        match: [/^[\+]?[0-9]{10,15}$/, 'رقم الهاتف غير صحيح']
    },
    
    country: {
        type: String,
        default: 'السعودية',
        trim: true
    },
    
    city: {
        type: String,
        trim: true
    },
    
    profileImage: {
        type: String,
        default: '/assets/images/avatars/default.png'
    },
    
    bio: {
        type: String,
        maxlength: [500, 'السيرة الذاتية يجب أن لا تتجاوز 500 حرف'],
        default: ''
    },
    
    // الدور والصلاحيات
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student'
    },
    
    specialization: {
        type: String,
        enum: [
            'math', 'science', 'arabic', 'english', 
            'history', 'geography', 'computer', 
            'art', 'sports', 'other'
        ],
        default: 'other'
    },
    
    // التعليم والخبرة
    educationLevel: {
        type: String,
        enum: ['bachelor', 'master', 'phd', 'diploma', 'other']
    },
    
    yearsOfExperience: {
        type: Number,
        min: 0,
        max: 50,
        default: 0
    },
    
    // الإحصائيات والتتبع
    enrolledCourses: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date
    }],
    
    completedCourses: {
        type: Number,
        default: 0
    },
    
    totalStudyHours: {
        type: Number,
        default: 0
    },
    
    // الحالة والتواريخ
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    
    lastLogin: Date,
    
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // التواريخ
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// الفهرس لتحسين الأداء
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

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

// تحديث updatedAt قبل التحديث
userSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

// مقارنة كلمات المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// إنشاء توكن JWT
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { 
            id: this._id, 
            email: this.email, 
            role: this.role,
            name: `${this.firstName} ${this.lastName}`
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// إنشاء توكن إعادة تعيين كلمة المرور
userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 دقائق
    
    return resetToken;
};

// إنشاء توكن التحقق من البريد
userSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 ساعة
    
    return verificationToken;
};

// Virtual للحصول على الاسم الكامل
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual للحصول على الدور بشكل مقروء
userSchema.virtual('roleName').get(function() {
    const roles = {
        'student': 'طالب',
        'teacher': 'مدرب',
        'admin': 'مسؤول'
    };
    return roles[this.role] || this.role;
});

// طريقة لتحويل المستخدم إلى JSON (إخفاء البيانات الحساسة)
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    
    // إخفاء البيانات الحساسة
    delete user.password;
    delete user.__v;
    delete user.emailVerificationToken;
    delete user.emailVerificationExpires;
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    
    return user;
};

module.exports = mongoose.model('User', userSchema);
