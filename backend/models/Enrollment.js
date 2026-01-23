const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    // العلاقات
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    
    // معلومات التسجيل
    enrolledAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    
    enrollmentMethod: {
        type: String,
        enum: ['free', 'paid', 'invitation', 'promotion'],
        default: 'free'
    },
    
    // التقدم
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    
    completedLessons: [{
        lessonId: mongoose.Schema.Types.ObjectId,
        completedAt: Date,
        timeSpent: Number // بالثواني
    }],
    
    lastAccessedAt: Date,
    
    totalTimeSpent: {
        type: Number, // بالثواني
        default: 0
    },
    
    // الإنجاز
    isCompleted: {
        type: Boolean,
        default: false
    },
    
    completedAt: Date,
    
    // التقييم
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    
    review: {
        type: String,
        maxlength: [1000, 'التقييم يجب أن لا يتجاوز 1000 حرف']
    },
    
    reviewedAt: Date,
    
    // الشهادة
    certificateIssued: {
        type: Boolean,
        default: false
    },
    
    certificateId: String,
    
    certificateIssuedAt: Date,
    
    // الدفع
    paymentId: String,
    
    amountPaid: {
        type: Number,
        default: 0
    },
    
    currency: {
        type: String,
        default: 'USD'
    },
    
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    
    paymentMethod: String,
    
    // البيانات الوصفية
    metadata: {
        ipAddress: String,
        userAgent: String,
        referrer: String
    },
    
    // الحالة
    status: {
        type: String,
        enum: ['active', 'paused', 'cancelled', 'expired'],
        default: 'active'
    },
    
    expiresAt: Date,
    
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
    timestamps: true
});

// الفهارس لتحسين الأداء
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ user: 1 });
enrollmentSchema.index({ course: 1 });
enrollmentSchema.index({ enrolledAt: -1 });
enrollmentSchema.index({ isCompleted: 1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ paymentStatus: 1 });

// تحديث updatedAt قبل التحديث
enrollmentSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

// تحديث التقدم تلقائياً
enrollmentSchema.methods.updateProgress = function(totalLessons) {
    if (totalLessons > 0) {
        const completedCount = this.completedLessons.length;
        this.progress = Math.round((completedCount / totalLessons) * 100);
        
        if (this.progress >= 100) {
            this.isCompleted = true;
            this.completedAt = new Date();
        }
    }
    return this;
};

// Virtual للحصول على مدة الدراسة بشكل مقروء
enrollmentSchema.virtual('timeSpentFormatted').get(function() {
    const hours = Math.floor(this.totalTimeSpent / 3600);
    const minutes = Math.floor((this.totalTimeSpent % 3600) / 60);
    
    if (hours > 0 && minutes > 0) {
        return `${hours} ساعة ${minutes} دقيقة`;
    } else if (hours > 0) {
        return `${hours} ساعة`;
    } else if (minutes > 0) {
        return `${minutes} دقيقة`;
    } else {
        return 'أقل من دقيقة';
    }
});

// Virtual للتحقق إذا كان التسجيل نشطاً
enrollmentSchema.virtual('isActive').get(function() {
    if (this.status !== 'active') return false;
    if (this.expiresAt && this.expiresAt < new Date()) return false;
    return true;
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
