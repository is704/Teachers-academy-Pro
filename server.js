const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// استيراد النماذج
const User = require('./models/User');

// إنشاء التطبيق
const app = express();
const PORT = process.env.PORT || 3000;

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/language-platform', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ تم الاتصال بقاعدة البيانات'))
.catch(err => console.error('❌ خطأ في الاتصال:', err));

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware للتحقق من المصادقة
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'الوصول مرفوع، يلزم تسجيل الدخول' });
        }

        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'المستخدم غير موجود' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'رمز الدخول غير صالح' });
    }
};

// Middleware للتحقق من الدور
const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'غير مصرح بالوصول' });
        }
        next();
    };
};

// ==================== Routes ====================

// الصفحات الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/courses.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'courses.html'));
});

// ==================== API المستخدمين ====================

// تسجيل مستخدم جديد
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, learningGoal } = req.body;

        // التحقق من وجود المستخدم
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
        }

        // تحديد أهداف التعلم
        const learningGoals = {
            speaking: learningGoal.includes('التحدث'),
            listening: learningGoal.includes('الاستماع') || learningGoal.includes('التحدث'),
            writing: learningGoal.includes('الكتابة'),
            reading: learningGoal.includes('القراءة')
        };

        // إنشاء المستخدم
        const user = new User({
            name,
            email,
            password,
            learningGoals,
            profile: {
                languageLevel: 'beginner'
            }
        });

        await user.save();

        // إنشاء token
        const token = user.generateAuthToken();

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                subscription: user.subscription
            }
        });
    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        res.status(500).json({ error: 'حدث خطأ في التسجيل' });
    }
});

// تسجيل الدخول
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // البحث عن المستخدم
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // التحقق من كلمة المرور
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
        }

        // تحديث آخر دخول
        user.lastLogin = new Date();
        await user.save();

        // إنشاء token
        const token = user.generateAuthToken();

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                subscription: user.subscription,
                profile: user.profile
            }
        });
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        res.status(500).json({ error: 'حدث خطأ في تسجيل الدخول' });
    }
});

// الحصول على بيانات المستخدم الحالي
app.get('/api/user/me', authMiddleware, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ في جلب البيانات' });
    }
});

// تحديث بيانات المستخدم
app.put('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;
        
        // منع تحديث بعض الحقول
        const allowedUpdates = ['name', 'profile', 'settings', 'learningGoals'];
        const isValidUpdate = Object.keys(updates).every(key => 
            allowedUpdates.includes(key) || key.startsWith('profile.') || key.startsWith('settings.')
        );

        if (!isValidUpdate) {
            return res.status(400).json({ error: 'تحديث غير مسموح' });
        }

        Object.keys(updates).forEach(key => {
            if (key.includes('.')) {
                const [parent, child] = key.split('.');
                req.user[parent][child] = updates[key];
            } else {
                req.user[key] = updates[key];
            }
        });

        await req.user.save();

        res.json({
            success: true,
            message: 'تم تحديث الملف الشخصي',
            user: req.user
        });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ في التحديث' });
    }
});

// ==================== API الدورات ====================

// جلب جميع الدورات
app.get('/api/courses', async (req, res) => {
    try {
        const courses = [
            // الدورات المجانية
            { id: 1, title: 'أساسيات التحدث', skill: 'speaking', price: 0, type: 'free', level: 'مبتدئ' },
            { id: 2, title: 'الاستماع الأساسي', skill: 'listening', price: 0, type: 'free', level: 'مبتدئ' },
            { id: 3, title: 'الكتابة الإبداعية', skill: 'writing', price: 0, type: 'free', level: 'مبتدئ' },
            { id: 4, title: 'القراءة السريعة', skill: 'reading', price: 0, type: 'free', level: 'مبتدئ' },
            
            // الدورات المميزة
            { id: 5, title: 'التحدث المتقدم', skill: 'speaking', price: 450, type: 'premium', level: 'متقدم' },
            { id: 6, title: 'فهم اللهجات', skill: 'listening', price: 350, type: 'premium', level: 'متوسط' },
            { id: 7, title: 'الكتابة الأكاديمية', skill: 'writing', price: 400, type: 'premium', level: 'متقدم' },
            { id: 8, title: 'القراءة النقدية', skill: 'reading', price: 300, type: 'premium', level: 'متقدم' }
        ];

        // تطبيق الفلاتر إذا وجدت
        const { type, skill, level } = req.query;
        let filteredCourses = courses;

        if (type) {
            filteredCourses = filteredCourses.filter(course => course.type === type);
        }
        
        if (skill) {
            filteredCourses = filteredCourses.filter(course => course.skill === skill);
        }
        
        if (level) {
            filteredCourses = filteredCourses.filter(course => course.level === level);
        }

        res.json(filteredCourses);
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ في جلب الدورات' });
    }
});

// التسجيل في دورة
app.post('/api/courses/enroll', authMiddleware, async (req, res) => {
    try {
        const { courseId } = req.body;
        const user = req.user;

        // التحقق إذا كان مسجل بالفعل
        const alreadyEnrolled = user.progress.currentCourses.some(
            course => course.courseId.toString() === courseId
        );

        if (alreadyEnrolled) {
            return res.status(400).json({ error: 'أنت مسجل في هذه الدورة بالفعل' });
        }

        // إضافة الدورة للمستخدم
        user.progress.currentCourses.push({
            courseId,
            progress: 0,
            lastAccessed: new Date()
        });

        await user.save();

        res.json({
            success: true,
            message: 'تم التسجيل في الدورة بنجاح',
            courseId
        });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ في التسجيل' });
    }
});

// ==================== مساحات التدريب ====================

app.get('/writing-space', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head><title>مساحة الكتابة</title></head>
        <body>
            <h1>✍️ مساحة الكتابة</h1>
            <p>هذه مساحة للتدرب على الكتابة العربية</p>
            <a href="/courses.html">العودة للدورات</a>
        </body>
        </html>
    `);
});

app.get('/reading-space', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head><title>مساحة القراءة</title></head>
        <body>
            <h1>📖 مساحة القراءة</h1>
            <p>هذه مساحة للتدرب على القراءة العربية</p>
            <a href="/courses.html">العودة للدورات</a>
        </body>
        </html>
    `);
});

// ==================== لوحة التحكم ====================

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// API لوحة التحكم
app.get('/api/dashboard', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        
        // حساب الإحصائيات
        const stats = {
            totalCourses: user.progress.currentCourses.length,
            completedCourses: user.progress.completedCourses.length,
            totalStudyTime: user.progress.totalStudyTime,
            averageProgress: user.progress.currentCourses.length > 0
                ? user.progress.currentCourses.reduce((sum, course) => sum + course.progress, 0) / user.progress.currentCourses.length
                : 0
        };

        res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                subscription: user.subscription,
                profile: user.profile
            },
            stats,
            currentCourses: user.progress.currentCourses,
            learningGoals: user.learningGoals
        });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ في جلب بيانات اللوحة' });
    }
});

// ==================== صفحة 404 ====================

app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head><title>404 - غير موجود</title></head>
        <body>
            <h1>404 - الصفحة غير موجودة</h1>
            <a href="/">العودة للرئيسية</a>
        </body>
        </html>
    `);
});

// ==================== بدء الخادم ====================

app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل على: http://localhost:${PORT}`);
    console.log(`📚 الدورات: http://localhost:${PORT}/courses.html`);
    console.log(`👤 لوحة التحكم: http://localhost:${PORT}/dashboard.html`);
    console.log(`🔐 تسجيل الدخول: http://localhost:${PORT}/login.html`);
    console.log(`📝 التسجيل: http://localhost:${PORT}/register.html`);
});
