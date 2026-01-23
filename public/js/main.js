// ====== Teachers Academy PRO - Main JavaScript ======

// API Base URL
const API_BASE = '/api';

// تحميل الدورات من API
async function loadCourses() {
    try {
        const response = await fetch(`${API_BASE}/courses`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to load courses');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        return [];
    }
}

// عرض الدورات في العنصر المحدد
async function renderCourses(containerId, limit = 0) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // عرض مؤشر تحميل
    container.innerHTML = `
        <div class="loading-container" style="text-align: center; padding: 2rem;">
            <div class="loading" style="margin: 0 auto;"></div>
            <p style="margin-top: 1rem;">جاري تحميل الدورات...</p>
        </div>
    `;
    
    try {
        const courses = await loadCourses();
        let coursesToShow = limit > 0 ? courses.slice(0, limit) : courses;
        
        if (coursesToShow.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-book-open" style="font-size: 3rem; color: var(--gray-light); margin-bottom: 1rem;"></i>
                    <h3>لا توجد دورات متاحة حالياً</h3>
                    <p>سيتم إضافة دورات جديدة قريباً</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        coursesToShow.forEach(course => {
            const courseCard = createCourseCard(course);
            container.appendChild(courseCard);
        });
    } catch (error) {
        container.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 3rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--danger); margin-bottom: 1rem;"></i>
                <h3>عذراً، حدث خطأ في تحميل البيانات</h3>
                <p>يرجى المحاولة مرة أخرى لاحقاً</p>
            </div>
        `;
    }
}

// إنشاء بطاقة دورة
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card hover-lift';
    
    const priceDisplay = course.price === 0 ? 'مجاناً' : `$${course.price}`;
    const studentsDisplay = course.students || 0;
    
    card.innerHTML = `
        <div class="course-image">
            <i class="fas fa-book-open"></i>
        </div>
        <div class="course-content">
            <div class="course-category">${course.category || 'تعليم'}</div>
            <h3 class="course-title">${course.title}</h3>
            <p>${course.description || 'دورة تدريبية للمعلمين'}</p>
            <div class="course-instructor">
                <i class="fas fa-user-tie"></i>
                <span>${course.instructor || 'مجهول'}</span>
            </div>
            <div class="course-stats">
                <span>
                    <i class="fas fa-users"></i>
                    ${studentsDisplay} طالب
                </span>
                <span class="course-price">
                    ${priceDisplay}
                </span>
            </div>
            <button class="btn btn-primary btn-block mt-3 view-course-btn" data-id="${course._id || ''}">
                <i class="fas fa-info-circle"></i>
                التفاصيل
            </button>
        </div>
    `;
    
    // إضافة حدث النقر على الزر
    const viewBtn = card.querySelector('.view-course-btn');
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            const courseId = viewBtn.getAttribute('data-id');
            if (courseId) {
                window.location.href = `/course-detail.html?id=${courseId}`;
            } else {
                alert('تفاصيل الدورة غير متاحة حالياً');
            }
        });
    }
    
    return card;
}

// تسجيل الدخول
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // حفظ بيانات المستخدم في localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            // إعادة التوجيه للصفحة الرئيسية
            window.location.href = '/';
        } else {
            throw new Error(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// تسجيل مستخدم جديد
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // حفظ بيانات المستخدم في localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            // إعادة التوجيه للصفحة الرئيسية
            window.location.href = '/';
        } else {
            throw new Error(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// التحقق من حالة تسجيل الدخول
function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    return {
        isAuthenticated: !!(user && token),
        user: user ? JSON.parse(user) : null,
        token: token
    };
}

// تسجيل الخروج
function logoutUser() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
}

// تحديث واجهة المستخدم بناءً على حالة المصادقة
function updateUIForAuth() {
    const auth = checkAuth();
    const loginBtn = document.getElementById('login-btn');
    const userMenu = document.getElementById('user-menu');
    
    if (auth.isAuthenticated && userMenu) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        
        const userName = userMenu.querySelector('.user-name');
        if (userName && auth.user) {
            userName.textContent = auth.user.name || auth.user.email;
        }
    }
}

// إظهار رسالة للمستخدم
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
        color: white;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        animation: slideInFromRight 0.3s ease-out;
    `;
    
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span style="margin-right: 0.5rem;">${message}</span>
    `;
    
    document.body.appendChild(messageDiv);
    
    // إزالة الرسالة بعد 5 ثوانٍ
    setTimeout(() => {
        messageDiv.style.animation = 'slideInFromRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

// التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// التحقق من صحة كلمة المرور
function validatePassword(password) {
    return password.length >= 6;
}

// تهيئة التطبيق
function initApp() {
    // تحديث واجهة المستخدم بناءً على المصادقة
    updateUIForAuth();
    
    // إضافة أحداث لتسجيل الخروج
    const logoutBtns = document.querySelectorAll('.logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
        });
    });
    
    // إضافة تأثيرات للعناصر عند التمرير
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-up');
            }
        });
    }, { threshold: 0.1 });
    
    // مراقبة العناصر التي تحتاج إلى أنيميشن
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
    
    // تحميل الدورات في الصفحات التي تحتاجها
    if (document.getElementById('courses-container')) {
        renderCourses('courses-container', 6);
    }
    
    if (document.getElementById('featured-courses')) {
        renderCourses('featured-courses', 3);
    }
}

// تشغيل التطبيق عندما يصبح DOM جاهزاً
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// جعل الدوال متاحة عالمياً
window.TeachersAcademy = {
    loadCourses,
    renderCourses,
    loginUser,
    registerUser,
    checkAuth,
    logoutUser,
    showMessage,
    validateEmail,
    validatePassword
};

console.log('Teachers Academy PRO - JavaScript loaded successfully');
