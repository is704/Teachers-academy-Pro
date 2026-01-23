const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// استيراد النماذج
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');

async function seedDatabase() {
    try {
        console.log('🌱 بدء ملء قاعدة البيانات بالبيانات التجريبية...');
        
        // الاتصال بقاعدة البيانات
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ تم الاتصال بقاعدة البيانات');
        
        // تنظيف البيانات القديمة
        console.log('🧹 تنظيف البيانات القديمة...');
        await User.deleteMany({});
        await Course.deleteMany({});
        await Enrollment.deleteMany({});
        await Review.deleteMany({});
        
        // 1. إنشاء المستخدمين
        console.log('👥 إنشاء المستخدمين...');
        
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = [
            {
                firstName: 'المسؤول',
                lastName: 'العام',
                email: 'admin@teachers.com',
                password: hashedPassword,
                role: 'admin',
                phone: '+966500000001',
                isEmailVerified: true,
                bio: 'المسؤول العام للمنصة'
            },
            {
                firstName: 'أحمد',
                lastName: 'محمد',
                email: 'ahmed@teachers.com',
                password: hashedPassword,
                role: 'teacher',
                specialization: 'arabic',
                educationLevel: 'phd',
                yearsOfExperience: 15,
                phone: '+966500000002',
                isEmailVerified: true,
                bio: 'أستاذ اللغة العربية بخبرة 15 سنة في التعليم'
            },
            {
                firstName: 'سارة',
                lastName: 'علي',
                email: 'sara@teachers.com',
                password: hashedPassword,
                role: 'teacher',
                specialization: 'science',
                educationLevel: 'master',
                yearsOfExperience: 8,
                phone: '+966500000003',
                isEmailVerified: true,
                bio: 'مدرسة العلوم بخبرة 8 سنوات'
            },
            {
                firstName: 'خالد',
                lastName: 'حسين',
                email: 'khaled@teachers.com',
                password: hashedPassword,
                role: 'teacher',
                specialization: 'computer',
                educationLevel: 'bachelor',
                yearsOfExperience: 5,
                phone: '+966500000004',
                isEmailVerified: true,
                bio: 'مطور برمجيات ومدرس تقنية المعلومات'
            },
            {
                firstName: 'فاطمة',
                lastName: 'عبدالله',
                email: 'fatima@student.com',
                password: hashedPassword,
                role: 'student',
                specialization: 'other',
                phone: '+966500000005',
                isEmailVerified: true,
                bio: 'معلمة متحمسة للتطوير المهني'
            },
            {
                firstName: 'محمد',
                lastName: 'الزيد',
                email: 'mohammed@student.com',
                password: hashedPassword,
                role: 'student',
                specialization: 'math',
                phone: '+966500000006',
                isEmailVerified: true,
                bio: 'أحب الرياضيات وأريد تطوير طرق تدريسي'
            }
        ];
        
        const createdUsers = await User.insertMany(users);
        console.log(`✅ تم إنشاء ${createdUsers.length} مستخدم`);
        
        // 2. إنشاء الدورات
        console.log('📚 إنشاء الدورات...');
        
        const courses = [
            {
                title: 'أساسيات التعليم الإلكتروني',
                subtitle: 'كيفية التحول إلى التعليم الرقمي بفعالية',
                description: 'دورة شاملة تغطي جميع أساسيات التعليم الإلكتروني، من اختيار المنصات المناسبة إلى تصميم المحتوى التفاعلي',
                longDescription: 'في هذا العصر الرقمي، أصبح التعليم الإلكتروني ضرورة وليس رفاهية. هذه الدورة تقدم لك الدليل الشامل للتحول الناجح إلى التعليم الرقمي. ستتعلم كيفية اختيار المنصات التعليمية المناسبة، تصميم المحتوى التفاعلي، إدارة الفصول الافتراضية، وتقييم الطلاب عن بعد.',
                thumbnail: '/assets/images/courses/elearning.jpg',
                category: 'technology',
                level: 'beginner',
                tags: ['تعليم إلكتروني', 'تقنية', 'بداية'],
                instructor: createdUsers[1]._id,
                price: 0,
                isFree: true,
                totalLessons: 12,
                totalDuration: 360,
                isPublished: true,
                isFeatured: true,
                status: 'published',
                publishedAt: new Date(),
                prerequisites: ['معرفة أساسية باستخدام الكمبيوتر'],
                learningOutcomes: [
                    'فهم أساسيات التعليم الإلكتروني',
                    'القدرة على اختيار المنصات المناسبة',
                    'تصميم محتوى تعليمي تفاعلي',
                    'إدارة الفصول الافتراضية بفعالية'
                ]
            },
            {
                title: 'إدارة الفصول الدراسية الحديثة',
                subtitle: 'تقنيات مبتكرة لإدارة الفصول بفعالية',
                description: 'تعلم أحدث استراتيجيات إدارة الفصول الدراسية لخلق بيئة تعليمية إيجابية ومنتجة',
                longDescription: 'إدارة الفصول الدراسية هي فن وعلم. في هذه الدورة، ستتعلم أحدث الاستراتيجيات والتقنيات لإدارة الفصول بفعالية، من بناء العلاقات مع الطلاب إلى تصميم الأنشطة التفاعلية. ستتعلم كيفية التعامل مع التحديات السلوكية، تحفيز الطلاب، وخلق بيئة تعليمية إيجابية.',
                thumbnail: '/assets/images/courses/classroom.jpg',
                category: 'classroom-management',
                level: 'intermediate',
                tags: ['إدارة', 'فصول', 'تعليم'],
                instructor: createdUsers[2]._id,
                price: 49.99,
                discountPrice: 29.99,
                totalLessons: 15,
                totalDuration: 450,
                isPublished: true,
                isFeatured: true,
                status: 'published',
                publishedAt: new Date(),
                prerequisites: ['خبرة سنة في التدريس'],
                learningOutcomes: [
                    'إتقان استراتيجيات إدارة الفصول',
                    'التعامل مع التحديات السلوكية',
                    'تصميم أنشطة تفاعلية',
                    'بناء بيئة تعليمية إيجابية'
                ]
            },
            {
                title: 'التدريس بالإبداع والابتكار',
                subtitle: 'تحويل التعليم إلى تجربة ملهمة',
                description: 'اكتشف طرقاً مبتكرة لجعل التعليم أكثر إثارة وفعالية من خلال الإبداع والابتكار',
                longDescription: 'في عالم يتغير بسرعة، يحتاج التعليم إلى الإبداع والابتكار. هذه الدورة تقدم لك مجموعة من الأدوات والتقنيات المبتكرة لجعل التدريس أكثر إثارة وفعالية. ستتعلم كيفية تصميم دروس إبداعية، استخدام القصص في التعليم، دمج الفنون، وتحويل الفصل الدراسي إلى مساحة للإبداع.',
                thumbnail: '/assets/images/courses/creativity.jpg',
                category: 'teaching-methods',
                level: 'advanced',
                tags: ['إبداع', 'ابتكار', 'تعليم'],
                instructor: createdUsers[1]._id,
                price: 79.99,
                totalLessons: 18,
                totalDuration: 540,
                isPublished: true,
                status: 'published',
                publishedAt: new Date(),
                prerequisites: ['خبرة سنتين في التدريس'],
                learningOutcomes: [
                    'تصميم دروس إبداعية',
                    'استخدام القصص في التعليم',
                    'دمج الفنون في التدريس',
                    'خلق بيئة تعليمية ملهمة'
                ]
            },
            {
                title: 'تقنيات التقييم الحديثة',
                subtitle: 'من الاختبارات التقليدية إلى التقييم التكويني',
                description: 'تعلم أحدث أساليب التقييم التي تساعد في قياس تقدم الطلاب وتحسين عملية التعليم',
                longDescription: 'التقييم هو جزء أساسي من عملية التعليم. في هذه الدورة، ستتعلم الانتقال من الاختبارات التقليدية إلى أساليب التقييم الحديثة مثل التقييم التكويني، التقييم الذاتي، وتقييم الأقران. ستتعلم كيفية تصميم أدوات تقييم فعالة، تحليل النتائج، واستخدام البيانات لتحسين التعليم.',
                thumbnail: '/assets/images/courses/assessment.jpg',
                category: 'student-assessment',
                level: 'intermediate',
                tags: ['تقييم', 'قياس', 'تعليم'],
                instructor: createdUsers[2]._id,
                price: 39.99,
                totalLessons: 10,
                totalDuration: 300,
                isPublished: true,
                status: 'published',
                publishedAt: new Date(),
                learningOutcomes: [
                    'فهم أنواع التقييم المختلفة',
                    'تصميم أدوات تقييم فعالة',
                    'تحليل نتائج التقييم',
                    'استخدام التقييم لتحسين التعليم'
                ]
            },
            {
                title: 'الذكاء العاطفي للمعلمين',
                subtitle: 'كيفية تطوير الذكاء العاطفي لتحسين التدريس',
                description: 'تعلم كيفية تطوير الذكاء العاطفي لبناء علاقات أفضل مع الطلاب وتحسين البيئة التعليمية',
                longDescription: 'الذكاء العاطفي هو مهارة أساسية للمعلم الناجح. في هذه الدورة، ستتعلم كيفية تطوير الذكاء العاطفي لتحسين التواصل مع الطلاب، إدارة المشاعر، وبناء بيئة تعليمية داعمة. ستتعلم تقنيات التعاطف، الوعي الذاتي، وإدارة الضغوط في البيئة التعليمية.',
                thumbnail: '/assets/images/courses/eq.jpg',
                category: 'professional-development',
                level: 'beginner',
                tags: ['ذكاء عاطفي', 'تطوير', 'علاقات'],
                instructor: createdUsers[3]._id,
                price: 0,
                isFree: true,
                totalLessons: 8,
                totalDuration: 240,
                isPublished: true,
                status: 'published',
                publishedAt: new Date(),
                learningOutcomes: [
                    'فهم مكونات الذكاء العاطفي',
                    'تطوير مهارات التعاطف',
                    'إدارة المشاعر في الفصل',
                    'بناء علاقات إيجابية مع الطلاب'
                ]
            }
        ];
        
        const createdCourses = await Course.insertMany(courses);
        console.log(`✅ تم إنشاء ${createdCourses.length} دورة`);
        
        // 3. إنشاء التسجيلات
        console.log('📝 إنشاء التسجيلات في الدورات...');
        
        const enrollments = [
            // فاطمة مسجلة في 3 دورات
            {
                user: createdUsers[4]._id,
                course: createdCourses[0]._id,
                progress: 75,
                isCompleted: false,
                totalTimeSpent: 7200
            },
            {
                user: createdUsers[4]._id,
                course: createdCourses[1]._id,
                progress: 30,
                isCompleted: false,
                totalTimeSpent: 3600
            },
            {
                user: createdUsers[4]._id,
                course: createdCourses[4]._id,
                progress: 100,
                isCompleted: true,
                completedAt: new Date(),
                totalTimeSpent: 5400
            },
            // محمد مسجل في دورتين
            {
                user: createdUsers[5]._id,
                course: createdCourses[0]._id,
                progress: 100,
                isCompleted: true,
                completedAt: new Date(),
                totalTimeSpent: 10800
            },
            {
                user: createdUsers[5]._id,
                course: createdCourses[2]._id,
                progress: 50,
                isCompleted: false,
                totalTimeSpent: 9000
            }
        ];
        
        const createdEnrollments = await Enrollment.insertMany(enrollments);
        console.log(`✅ تم إنشاء ${createdEnrollments.length} تسجيل`);
        
        // 4. تحديث إحصائيات الدورات
        console.log('📊 تحديث إحصائيات الدورات...');
        
        for (const course of createdCourses) {
            const enrollmentsCount = await Enrollment.countDocuments({ course: course._id });
            const completedCount = await Enrollment.countDocuments({ 
                course: course._id, 
                isCompleted: true 
            });
            
            await Course.findByIdAndUpdate(course._id, {
                studentsEnrolled: enrollmentsCount,
                studentsCompleted: completedCount
            });
        }
        
        // 5. إنشاء التقييمات
        console.log '⭐ إنشاء التقييمات...');
        
        const reviews = [
            {
                user: createdUsers[4]._id,
                course: createdCourses[0]._id,
                enrollment: createdEnrollments[0]._id,
                rating: 5,
                title: 'دورة رائعة للمبتدئين',
                content: 'الدورة ممتازة وشاملة، ساعدتني في فهم أساسيات التعليم الإلكتروني. المحتوى واضح والتمارين عملية.',
                pros: ['محتوى شامل', 'أمثلة عملية', 'تسلسل منطقي'],
                cons: ['يمكن إضافة المزيد من الأمثلة'],
                isVerifiedPurchase: true,
                helpfulCount: 12
            },
            {
                user: createdUsers[5]._id,
                course: createdCourses[0]._id,
                enrollment: createdEnrollments[3]._id,
                rating: 4,
                title: 'مفيدة جداً',
                content: 'الدورة غطت جميع الأساسيات التي أحتاجها. المدرب ممتاز في الشرح.',
                pros: ['شرح واضح', 'منظمة جيداً', 'مجانية'],
                cons: ['بعض الفيديوهات تحتاج تحديث'],
                isVerifiedPurchase: true,
                helpfulCount: 8
            }
        ];
        
        const createdReviews = await Review.insertMany(reviews);
        console.log(`✅ تم إنشاء ${createdReviews.length} تقييم`);
        
        console.log('🎉 تم ملء قاعدة البيانات بنجاح!');
        console.log('\n🔑 بيانات الدخول:');
        console.log('👑 المسؤول: admin@teachers.com / password123');
        console.log('👨‍🏫 المدربين: ahmed@teachers.com / password123');
        console.log('👩‍🎓 الطلاب: fatima@student.com / password123');
        console.log('\n👉 يمكنك الآن البدء في استخدام التطبيق!');
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ خطأ في ملء قاعدة البيانات:', error);
        process.exit(1);
    }
}

// تشغيل وظيفة الملء
seedDatabase();
