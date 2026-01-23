const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes للصفحات الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/courses.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'courses.html'));
});

// نظام المهارات التفاعلي
app.get('/courses/:skill/:type?', (req, res) => {
    const { skill, type } = req.params;
    
    // هنا يمكنك إعادة توجيه لصفحة المهارة المحددة
    if (type === 'free') {
        res.send(`
            <html dir="rtl">
            <head><title>${skill} - مجاني</title></head>
            <body>
                <h1>مرحباً في دورة ${skill} المجانية!</h1>
                <p>يمكنك البدء في التعلم الآن</p>
                <a href="/courses.html">العودة للدورات</a>
            </body>
            </html>
        `);
    } else {
        res.sendFile(path.join(__dirname, 'public', 'courses.html'));
    }
});

// مساحة الكتابة التفاعلية
app.get('/writing-space', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head>
            <title>مساحة الكتابة</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                textarea { width: 100%; height: 300px; padding: 10px; }
                button { padding: 10px 20px; background: #2ecc71; color: white; border: none; }
            </style>
        </head>
        <body>
            <h1>✍️ مساحة التدرب على الكتابة</h1>
            <textarea id="writingArea" placeholder="اكتب نصك هنا..."></textarea>
            <br><br>
            <button onclick="checkWriting()">تحقق من الأخطاء</button>
            <button onclick="saveDraft()">حفظ المسودة</button>
            
            <div id="results" style="margin-top: 20px;"></div>
            
            <script>
                function checkWriting() {
                    const text = document.getElementById('writingArea').value;
                    // هنا يمكن إضافة API للتحقق من الأخطاء
                    document.getElementById('results').innerHTML = 
                        '<h3>التحليل الأولي:</h3>' +
                        '<p>عدد الكلمات: ' + text.split(' ').length + '</p>' +
                        '<p>نصائح: تأكد من علامات الترقيم والقواعد</p>';
                }
                
                function saveDraft() {
                    alert('تم حفظ المسودة');
                }
            </script>
        </body>
        </html>
    `);
});

// مساحة القراءة
app.get('/reading-space', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head>
            <title>مساحة القراءة</title>
            <style>
                body { font-family: Arial; padding: 20px; max-width: 800px; margin: 0 auto; }
                .text { line-height: 2; font-size: 18px; }
                .questions { background: #f8f9fa; padding: 20px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <h1>📖 مساحة القراءة</h1>
            
            <div class="text">
                <h2>نص للقراءة:</h2>
                <p>اللغة العربية هي لغة القرآن الكريم، وتتميز بغناها اللغوي وجمال تعبيرها. 
                تحتوي العربية على ملايين المفردات وتتميز بنظام صرفي ونحوي دقيق.</p>
                
                <p>تطورت اللغة العربية عبر العصور، وحافظت على أصالتها رغم تأثرها ببعض اللغات الأخرى.
                اليوم، تعد العربية من أكثر اللغات انتشاراً في العالم.</p>
            </div>
            
            <div class="questions">
                <h3>أسئلة الفهم:</h3>
                <ol>
                    <li>ما هي مميزات اللغة العربية؟</li>
                    <li>كيف حافظت العربية على أصالتها؟</li>
                    <li>ما هو مكانة العربية بين لغات العالم؟</li>
                </ol>
                
                <button onclick="showAnswers()">عرض الإجابات</button>
                <div id="answers" style="display: none; margin-top: 10px;">
                    <p><strong>الإجابات:</strong></p>
                    <p>1. غنية بالمفردات، نظام صرفي دقيق، لغة القرآن.</p>
                    <p>2. حافظت على قواعدها الأساسية رغم بعض التأثيرات الخارجية.</p>
                    <p>3. من أكثر اللغات انتشاراً في العالم.</p>
                </div>
            </div>
            
            <script>
                function showAnswers() {
                    document.getElementById('answers').style.display = 'block';
                }
            </script>
        </body>
        </html>
    `);
});

// API للدورات
app.get('/api/courses', (req, res) => {
    const courses = [
        // الدورات المجانية
        { id: 1, title: 'أساسيات التحدث', skill: 'speaking', price: 0, type: 'free' },
        { id: 2, title: 'الاستماع الأساسي', skill: 'listening', price: 0, type: 'free' },
        { id: 3, title: 'الكتابة الإبداعية', skill: 'writing', price: 0, type: 'free' },
        { id: 4, title: 'القراءة السريعة', skill: 'reading', price: 0, type: 'free' },
        
        // الدورات المميزة
        { id: 5, title: 'التحدث المتقدم', skill: 'speaking', price: 450, type: 'premium' },
        { id: 6, title: 'فهم اللهجات', skill: 'listening', price: 350, type: 'premium' },
        { id: 7, title: 'الكتابة الأكاديمية', skill: 'writing', price: 400, type: 'premium' },
        { id: 8, title: 'القراءة النقدية', skill: 'reading', price: 300, type: 'premium' }
    ];
    
    res.json(courses);
});

// API للتسجيل
app.post('/api/enroll', (req, res) => {
    const { courseId, userId } = req.body;
    res.json({ 
        success: true, 
        message: 'تم التسجيل بنجاح',
        courseId,
        access: 'مباشر' 
    });
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`✅ الخادم يعمل على: http://localhost:${PORT}`);
    console.log(`🌐 رابط المنصة: http://localhost:${PORT}/courses.html`);
    console.log(`📚 مساحة الكتابة: http://localhost:${PORT}/writing-space`);
    console.log(`📖 مساحة القراءة: http://localhost:${PORT}/reading-space`);
});
