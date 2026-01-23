const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    
    enrollment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment'
    },
    
    // التقييم
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    
    title: {
        type: String,
        trim: true,
        maxlength: [200, 'عنوان التقييم يجب أن لا يتجاوز 200 حرف']
    },
    
    content: {
        type: String,
        required: [true, 'محتوى التقييم مطلوب'],
        minlength: [10, 'محتوى التقييم يجب أن يكون على الأقل 10 أحرف'],
        maxlength: [2000, 'محتوى التقييم يجب أن لا يتجاوز 2000 حرف']
    },
    
    // المميزات والعيوب
    pros: [{
        type: String,
        trim: true,
        maxlength: [100, 'كل ميزة يجب أن لا تتجاوز 100 حرف']
    }],
    
    cons: [{
        type: String,
        trim: true,
        maxlength: [100, 'كل عيب يجب أن لا يتجاوز 100 حرف']
    }],
    
    // الإعجابات
    helpfulCount: {
        type: Number,
        default: 0,
        min: 0
    },
    
    notHelpfulCount: {
        type: Number,
        default: 0,
        min: 0
    },
    
    usersWhoFoundHelpful: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    usersWhoFoundNotHelpful: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // الموافقة والتحقق
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    
    isApproved: {
        type: Boolean,
        default: true
    },
    
    isFeatured: {
        type: Boolean,
        default: false
    },
    
    // الحالة
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'hidden'],
        default: 'pending'
    },
    
    rejectionReason: {
        type: String,
        trim: true
    },
    
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

// الفهارس لتحسين الأداء
reviewSchema.index({ course: 1, rating: 1 });
reviewSchema.index({ user: 1, course: 1 }, { unique: true });
reviewSchema.index({ isApproved: 1 });
reviewSchema.index({ isFeatured: 1 });
reviewSchema.index({ helpfulCount: -1 });
reviewSchema.index({ createdAt: -1 });

// تحديث updatedAt قبل التحديث
reviewSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

// Virtual للحصول على نسبة المساعدة
reviewSchema.virtual('helpfulnessPercentage').get(function() {
    const total = this.helpfulCount + this.notHelpfulCount;
    return total > 0 ? Math.round((this.helpfulCount / total) * 100) : 0;
});

// Virtual للتحقق إذا كان التقييم مفيداً
reviewSchema.virtual('isHelpful').get(function() {
    return this.helpfulnessPercentage >= 70;
});

// تحديث إحصائيات الدورة بعد حفظ التقييم
reviewSchema.post('save', async function() {
    if (this.isApproved) {
        const Course = mongoose.model('Course');
        const Review = mongoose.model('Review');
        
        // حساب متوسط التقييمات
        const stats = await Review.aggregate([
            { $match: { course: this.course, isApproved: true } },
            {
                $group: {
                    _id: '$course',
                    averageRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);
        
        if (stats.length > 0) {
            await Course.findByIdAndUpdate(this.course, {
                averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
                totalRatings: stats[0].totalRatings,
                totalReviews: stats[0].totalReviews
            });
        }
    }
});

// تحديث إحصائيات الدورة بعد حذف التقييم
reviewSchema.post('remove', async function() {
    const Course = mongoose.model('Course');
    const Review = mongoose.model('Review');
    
    // إعادة حساب متوسط التقييمات
    const stats = await Review.aggregate([
        { $match: { course: this.course, isApproved: true } },
        {
            $group: {
                _id: '$course',
                averageRating: { $avg: '$rating' },
                totalRatings: { $sum: 1 },
                totalReviews: { $sum: 1 }
            }
        }
    ]);
    
    if (stats.length > 0) {
        await Course.findByIdAndUpdate(this.course, {
            averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
            totalRatings: stats[0].totalRatings,
            totalReviews: stats[0].totalReviews
        });
    } else {
        await Course.findByIdAndUpdate(this.course, {
            averageRating: 0,
            totalRatings: 0,
            totalReviews: 0
        });
    }
});

module.exports = mongoose.model('Review', reviewSchema);
