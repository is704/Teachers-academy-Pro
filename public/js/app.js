// تطبيق منصة تعلم اللغة
const LanguageApp = {
    // بيانات الدورات
    courses: [
        {
            id: 1,
            title: 'أساسيات التحدث',
            skill: 'speaking',
            level: 'مبتدئ',
            price: 0,
            type: 'free',
            description: 'تعلم أساسيات المحادثة اليومية',
            features: [
                '5 دروس مجانية',
                'تمارين نطق',
                'محادثات قصيرة',
                'تسجيلات صوتية'
            ]
        },
        {
            id: 2,
            title: 'التحدث المتقدم',
            skill: 'speaking',
            level: 'متقدم',
            price: 450,
            type: 'premium',
            description: 'التحدث بطلاقة في مواقف مهنية',
            features: [
                'جلسات مباشرة مع مدربين',
                'محاكاة مقابلات عمل',
                'تحليل النطق المتقدم',
                'دعم أسبوعي'
            ]
        },
        {
            id: 3,
            title: 'الاستماع الأساسي',
            skill: 'listening',
            level: 'مبتدئ',
            price: 0,
            type: 'free',
            description: 'فهم المحادثات البسيطة',
            features: [
                'تدريبات استماع قصيرة',
                'تمارين تمييز الأصوات',
                'مفردات أساسية',
                'اختبارات تفاعلية'
            ]
        },
        {
            id: 4,
            title: 'فهم اللهجات',
            skill: 'listening',
            level: 'متوسط',
            price: 350,
            type: 'premium',
            description: 'فهم مختلف اللهجات العربية',
            features: [
                'تعرف على 5 لهجات عربية',
                'تدريبات متقدمة',
                'فهم المحادثات السريعة',
                'دروس مع ناطقين أصليين'
            ]
        },
        {
            id: 5,
            title: 'الكتابة الإبداعية',
            skill: 'writing',
            level: 'مبتدئ',
            price: 0,
            type: 'free',
            description: 'تعلم أساسيات الكتابة العربية',
            features: [
                'قواعد الإملاء الأساسية',
                'تمارين كتابة قصيرة',
                'تصحيح تلقائي',
                'نموذج كتابة'
            ]
        },
        {
            id: 6,
            title: 'الكتابة الأكاديمية',
            skill: 'writing',
            level: 'متقدم',
            price: 400,
            type: 'premium',
            description: 'كتابة البحوث والتقارير الأكاديمية',
            features: [
                'تصحيح يدوي من خبراء',
                'نماذج أكاديمية',
                'ورش عمل كتابية',
                'تقييم تفصيلي'
            ]
        },
        {
            id: 7,
            title: 'القراءة السريعة',
            skill: 'reading',
            level: 'مبتدئ',
            price: 0,
            type: 'free',
            description: 'تحسين سرعة القراءة',
            features: [
                'تمارين قراءة سريعة',
                'نصوص متنوعة',
                'أسئلة فهم',
                'تتبع التقدم'
            ]
        },
        {
            id: 8,
            title: 'القراءة النقدية',
            skill: 'reading',
            level: 'متقدم',
            price: 300,
            type: 'premium',
            description: 'تحليل النصوص الأدبية',
            features: [
                'نصوص أدبية متنوعة',
                'تحليل عميق',
                'مناقشات جماعية',
                'توجيه من أساتذة'
            ]
        }
    ],

    // تهيئة التطبيق
    init() {
        this.loadCourses();
        this.setupEventListeners();
    },

    // تحميل وعرض الدورات
    loadCourses() {
        const container = document.getElementById('courses-container');
        if (!container) return;

        let html = '';
        
        this.courses.forEach(course => {
            html += `
                <div class="course-card ${course.type}">
                    <div class="tags">
                        <span class="tag tag-${course.type}">${course.type === 'free' ? 'مجاني' : 'مميز'}</span>
                        <span class="tag">${course.skill}</span>
                        <span class="tag">${course.level}</span>
                    </div>
                    
                    <h3>${course.title}</h3>
                    <p>${course.description}</p>
                    
                    <ul class="features">
                        ${course.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                    
                    <div class="price price-${course.type}">
                        ${course.price === 0 ? 'مجاني' : `${course.price} درهم`}
                    </div>
                    
                    <button class="btn btn-${course.type}" onclick="LanguageApp.enroll(${course.id})">
                        ${course.type === 'free' ? 'ابدأ التعلم' : 'اشترك الآن'}
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },

    // التسجيل في دورة
    enroll(courseId) {
        const course = this.courses.find(c => c.id === courseId);
        if (!course) return;

        if (course.type === 'free') {
            window.location.href = `/courses/${course.skill}/free`;
        } else {
            window.location.href = `/payment?course=${courseId}`;
        }
    },

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // تصفية الدورات
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterCourses(filter);
            });
        });
    },

    // تصفية الدورات
    filterCourses(filter) {
        let filtered = this.courses;
        
        if (filter === 'free') {
            filtered = this.courses.filter(c => c.type === 'free');
        } else if (filter === 'premium') {
            filtered = this.courses.filter(c => c.type === 'premium');
        } else if (filter !== 'all') {
            filtered = this.courses.filter(c => c.skill === filter);
        }
        
        this.displayFilteredCourses(filtered);
    },

    // عرض الدورات المصفاة
    displayFilteredCourses(courses) {
        const container = document.getElementById('courses-container');
        // تحديث العرض (سيتم تنفيذه لاحقاً)
    }
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    LanguageApp.init();
});
