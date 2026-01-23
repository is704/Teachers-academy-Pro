const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'عنوان الدرس مطلوب'],
        trim: true,
        maxlength: [200, 'عنوان الدرس يجب أن لا يتجاوز 200 حرف']
    },
    
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'وصف الدرس يجب أن لا يتجاوز 1000 حرف']
    },
    
    content: {
        type: String,
        required: [true, 'محتوى الدرس مطلوب']
    },
    
    videoUrl: {
        type: String,
        trim: true
    },
    
    duration: {
        type: Number, // بالدقائق
        min: [1, 'مدة الدرس يجب أن تكون دقيقة واحدة على الأقل'],
        default: 0
    },
    
    resources: [{
        title: String,
        url: String,
        type: {
            type: String,
            enum: ['pdf', 'doc', 'ppt', 'image', 'video', 'link'],
            default: 'link'
        }
    }],
    
    isFreePreview: {
        type: Boolean,
        default: false
    },
    
    order: {
        type: Number,
        required: true,
        min: 1
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'عنوان الوحدة مطلوب'],
        trim: true,
        maxlength: [200, 'عنوان الوحدة يجب أن لا يتجاوز 200 حرف']
    },
    
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'وصف الوحدة يجب أن لا يتجاوز 500 حرف']
    },
    
    lessons: [lessonSchema],
    
    order: {
        type: Number,
        required: true,
        min: 1
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const courseSchema = new mongoose.Schema({
    // المعلومات الأساسية
    title: {
        type: String,
        required: [true, 'عنوان الدورة مطلوب'],
        trim: true,
        maxlength: [200, 'عنوان الدورة يجب أن لا يتجاوز 200 حرف']
    },
    
    subtitle: {
        type: String,
        trim: true,
        maxlength: [300, 'العنوان الفرعي يجب أن لا يتجاوز 300 حرف']
    },
    
    description: {
        type: String,
        required: [true, 'وصف الدورة مطلوب'],
        minlength: [50, 'وصف الدورة يجب أن يكون على الأقل 50 حرفاً']
    },
    
    longDescription: {
        type: String,
        trim: true
    },
    
    // الصور والفيديوهات
    thumbnail: {
        type: String,
        default: '/assets/images/courses/default-thumbnail.jpg'
    },
    
    promoVideo: {
        type: String,
        trim: true
    },
    
    // الفئات والمستويات
    category: {
        type: String,
        required: [true, 'فئة الدورة مطلوبة'],
        enum: [
            'teaching-methods',
            'technology',
            'classroom-management',
            'student-assessment',
            'special-education',
            'curriculum-design',
            'professional-development',
            'educational-leadership',
            'language-teaching',
            'stem-education'
        ]
    },
    
    subcategory: {
        type: String,
        trim: true
    },
    
    level: {
        type: String,
        required: true,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    
    // المدرب
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    coInstructors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // المحتوى
    modules: [moduleSchema],
    
    totalLessons: {
        type: Number,
        default: 0
    },
    
    totalDuration: {
        type: Number, // إجمالي الدقائق
        default: 0
    },
    
    // التسعير
    price: {
        type: Number,
        required: true,
        min: [0, 'السعر يجب أن يكون 0 أو أكثر'],
        default: 0
    },
    
    discountPrice: {
        type: Number,
        min: [0, 'سعر الخصم يجب أن يكون 0 أو أكثر']
    },
    
    isFree: {
        type: Boolean,
        default: false
    },
    
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'SAR', 'AED', 'EUR']
    },
    
    // الإحصائيات
    studentsEnrolled: {
        type: Number,
        default: 0,
        min: 0
    },
    
    studentsCompleted: {
        type: Number,
        default: 0,
        min: 0
    },
    
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    
    totalRatings: {
        type: Number,
        default: 0,
        min: 0
    },
    
    totalReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // التواريخ
    startDate: {
        type: Date
    },
    
    endDate: {
        type: Date
    },
    
    publishedAt: Date,
    
    // الإعدادات
    isPublished: {
        type: Boolean,
        default: false
    },
    
    isFeatured: {
        type: Boolean,
        default: false
    },
    
    isApproved: {
        type: Boolean,
        default: false
    },
    
    requiresApproval: {
        type: Boolean,
        default: false
    },
    
    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'archived'],
        default: 'draft'
    },
    
    // المتطلبات
    prerequisites: [{
        type: String,
        trim: true
    }],
    
    learningOutcomes: [{
        type: String,
        trim: true
    }],
    
    // البيانات الوصفية
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    
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
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ studentsEnrolled: -1 });

// Virtual للحصول على السعر الحالي (بعد الخصم)
courseSchema.virtual('currentPrice').get(function() {
    return this.discountPrice || this.price;
});

// Virtual للتحقق إذا كانت الدورة مخفضة
courseSchema.virtual('hasDiscount').get(function() {
    return this.discountPrice && this.discountPrice < this.price;
});

// Virtual للحصول على نسبة الخصم
courseSchema.virtual('discountPercentage').get(function() {
    if (!this.hasDiscount) return 0;
    return Math.round((1 - this.discountPrice / this.price) * 100);
});

// Virtual للحصول على مدة الدورة بشكل مقروء
courseSchema.virtual('durationFormatted').get(function() {
    const hours = Math.floor(this.totalDuration / 60);
    const minutes = this.totalDuration % 60;
    
    if (hours > 0 && minutes > 0) {
        return `${hours} ساعة ${minutes} دقيقة`;
    } else if (hours > 0) {
        return `${hours} ساعة`;
    } else {
        return `${minutes} دقيقة`;
    }
});

// تحديث الإحصائيات قبل الحفظ
courseSchema.pre('save', function(next) {
    // حساب إجمالي الدروس والمدة
    this.totalLessons = this.modules.reduce((total, module) => {
        return total + (module.lessons ? module.lessons.length : 0);
    }, 0);
    
    this.totalDuration = this.modules.reduce((total, module) => {
        return total + module.lessons.reduce((moduleTotal, lesson) => {
            return moduleTotal + (lesson.duration || 0);
        }, 0);
    }, 0);
    
    // تحديث حالة isFree بناءً على السعر
    this.isFree = this.price === 0;
    
    next();
});

// تحديث updatedAt قبل التحديث
courseSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

module.exports = mongoose.model('Course', courseSchema);
