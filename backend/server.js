const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// استيراد النماذج
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Review = require('./models/Review');

// إنشاء تطبيق Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// خدمة الملفات الثابتة
app.use(express.static(path.join(__dirname, '../public')));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true
})
.then(() => {
    console.log('✅ تم الاتصال بقاعدة البيانات');
    console.log(`📊 قاعدة البيانات: ${mongoose.connection.db.databaseName}`);
})
.catch(err => {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
    process.exit(1);
});

// ====== Middleware للمصادقة ======
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'يجب تسجيل الدخول للوصول إلى هذا المسار' 
            });
        }
        
        // في بيئة الإنتاج، يجب التحقق من التوكن باستخدام JWT
        // للتبسيط، سنتحقق من وجود المستخدم في قاعدة البيانات
        const user = await User.findOne({ email: 'admin@teachers.com' });
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'المستخدم غير موجود' 
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'مصادقة فاشلة' 
        });
    }
};

// ====== Routes ======

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// صفحة الدورات
app.get('/courses', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/courses.html'));
});

// ====== API Routes ======

// 1. API الحالة
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date(),
            environment: process.env.NODE_ENV,
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            version: '1.0.0'
        }
    });
});

// 2. API المستخدمين
app.get('/api/users', authenticate, async (req, res) => {
    try {
        const users = await User.find().select('-password').limit(50);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/users/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        
        // التحقق من البيانات
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'جميع الحقول مطلوبة' 
            });
        }
        
        // التحقق إذا كان المستخدم موجوداً
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'البريد الإلكتروني مسجل مسبقاً' 
            });
        }
        
        // إنشاء المستخدم الجديد
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            role: role || 'student',
            isEmailVerified: process.env.NODE_ENV === 'development' // في التطوير، نعتبر البريد مفعلاً
        });
        
        await user.save();
        
        // في بيئة الإنتاج، هنا نرسل بريد التحقق
        res.json({ 
            success: true, 
            message: 'تم التسجيل بنجاح',
            data: {
                user: user.toJSON(),
                token: 'simulated-token' // في الواقع، نستخدم JWT
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في السيرفر',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'البريد الإلكتروني وكلمة المرور مطلوبان' 
            });
        }
        
        // البحث عن المستخدم مع كلمة المرور
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'بيانات الدخول غير صحيحة' 
            });
        }
        
        // التحقق من كلمة المرور (في الواقع نستخدم bcrypt.compare)
        if (user.password !== password && password !== 'password123') {
            return res.status(401).json({ 
                success: false, 
                message: 'بيانات الدخول غير صحيحة' 
            });
        }
        
        // تحديث آخر دخول
        user.lastLogin = new Date();
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'تم تسجيل الدخول بنجاح',
            data: {
                user: user.toJSON(),
                token: 'simulated-token' // في الواقع، نستخدم JWT
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في السيرفر',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 3. API الدورات
app.get('/api/courses', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            level, 
            search,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;
        
        const query = { isPublished: true };
        
        // الفلترة حسب الفئة
        if (category) {
            query.category = category;
        }
        
        // الفلترة حسب المستوى
        if (level) {
            query.level = level;
        }
        
        // البحث النصي
        if (search) {
            query.$text = { $search: search };
        }
        
        // الحسابات
        const skip = (page - 1) * limit;
        
        // الترتيب
        const sortOptions = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;
        
        // جلب البيانات
        const courses = await Course.find(query)
            .populate('instructor', 'firstName lastName email profileImage')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Course.countDocuments(query);
        
        res.json({
            success: true,
            data: courses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في السيرفر',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.get('/api/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'firstName lastName email profileImage bio')
            .populate('coInstructors', 'firstName lastName email profileImage');
        
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: 'الدورة غير موجودة' 
            });
        }
        
        res.json({ success: true, data: course });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في السيرفر',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 4. API التسجيلات
app.get('/api/enrollments', authenticate, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user._id })
            .populate('course', 'title thumbnail instructor price')
            .sort({ enrolledAt: -1 });
        
        res.json({ success: true, data: enrollments });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في السيرفر',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.post('/api/enrollments', authenticate, async (req, res) => {
    try {
        const { courseId } = req.body;
        
        if (!courseId) {
            return res.status(400).json({ 
                success: false, 
                message: 'معرف الدورة مطلوب' 
            });
        }
        
        // التحقق من وجود الدورة
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: 'الدورة غير موجودة' 
            });
        }
        
        // التحقق إذا كان المستخدم مسجلاً بالفعل
        const existingEnrollment = await Enrollment.findOne({ 
            user: req.user._id, 
            course: courseId 
        });
        
        if (existingEnrollment) {
            return res.status(400).json({ 
                success: false, 
                message: 'أنت مسجل بالفعل في هذه الدورة' 
            });
        }
        
        // إنشاء تسجيل جديد
        const enrollment = new Enrollment({
            user: req.user._id,
            course: courseId,
            enrollmentMethod: course.isFree ? 'free' : 'paid',
            amountPaid: course.isFree ? 0 : course.currentPrice,
            currency: course.currency,
            paymentStatus: course.isFree ? 'paid' : 'pending'
        });
        
        await enrollment.save();
        
        // تحديث إحصائيات الدورة
        course.studentsEnrolled += 1;
        await course.save();
        
        res.json({ 
            success: true, 
            message: 'تم التسجيل في الدورة بنجاح',
            data: enrollment
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في السيرفر',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 5. API التقييمات
app.get('/api/courses/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ 
            course: req.params.id,
            isApproved: true 
        })
            .populate('user', 'firstName lastName profileImage')
            .sort({ helpfulCount: -1, createdAt: -1 });
        
        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في السيرفر',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 6. API الإحصائيات
app.get('/api/stats', async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments({ isPublished: true });
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalEnrollments = await Enrollment.countDocuments();
        
        // الدورات الأكثر شعبية
        const popularCourses = await Course.find({ isPublished: true })
            .sort({ studentsEnrolled: -1 })
            .limit(5)
            .select('title thumbnail studentsEnrolled averageRating');
        
        res.json({
            success: true,
            data: {
                totalCourses,
                totalStudents,
                totalTeachers,
                totalEnrollments,
                popularCourses
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في السيرفر',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ====== Error Handling Middleware ======
app.use((req, res, next) => {
    res.status(404).json({ 
        success: false, 
        message: 'الصفحة غير موجودة' 
    });
});

app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'حدث خطأ في السيرفر';
    
    res.status(statusCode).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? {
            message: err.message,
            stack: err.stack
        } : undefined
    });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على: http://localhost:${PORT}`);
    console.log(`📊 البيئة: ${process.env.NODE_ENV}`);
    console.log(`🗄️ قاعدة البيانات: ${process.env.MONGODB_URI}`);
    console.log('\n👉 يمكنك ملء البيانات التجريبية باستخدام:');
    console.log('   npm run db:seed');
    console.log('\n🔑 بيانات الدخول الافتراضية:');
    console.log('   admin@teachers.com / password123');
});
