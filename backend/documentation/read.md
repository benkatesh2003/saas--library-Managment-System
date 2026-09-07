//Our api end points
/api/health                              GET     Health check

/api/super-admin/auth/register           POST    Register super admin
/api/super-admin/auth/login              POST    Login super admin
/api/super-admin/auth/profile            GET     Get profile
/api/super-admin/feature/create          POST    Create feature
/api/super-admin/feature/all             GET     List features
/api/super-admin/feature/get/:id         GET     Get feature
/api/super-admin/feature/update/:id      PUT     Update feature
/api/super-admin/feature/delete/:id      DELETE  Delete feature
/api/super-admin/feature/toggle/:id      PATCH   Toggle feature
/api/super-admin/plan/create             POST    Create plan
/api/super-admin/plan/all                GET     List plans
/api/super-admin/plan/get/:id            GET     Get plan
/api/super-admin/plan/update/:id         PUT     Update plan
/api/super-admin/plan/delete/:id         DELETE  Delete plan
/api/super-admin/plan/toggle/:id         PATCH   Toggle plan
/api/super-admin/subscription/all        GET     List subscriptions
/api/super-admin/subscription/get/:id    GET     Get subscription
/api/super-admin/subscription/admin/:id  GET     Subscriptions by admin
/api/super-admin/subscription/status/:id PATCH   Update status

/api/admin/auth/register                 POST    Register admin
/api/admin/auth/login                    POST    Login admin
/api/admin/auth/google/login             POST    Google OAuth login
/api/admin/auth/profile                  GET     Get profile
/api/admin/auth/profile                  PUT     Update profile
/api/admin/student/admit                 POST    Admit student
/api/admin/student/all                   GET     List students
/api/admin/student/get/:id               GET     Get student
/api/admin/student/update/:id            PUT     Update student
/api/admin/student/delete/:id            DELETE  Delete student
/api/admin/student/search                GET     Search students
/api/admin/seat/*                        CRUD    Seat management
/api/admin/shift/*                       CRUD    Shift management
/api/admin/locker/*                      CRUD    Locker management
/api/admin/book/*                        CRUD    Book management
/api/admin/payment/create-order          POST    Razorpay order
/api/admin/payment/verify-payment        POST    Verify payment
/api/admin/dashboard/stats               GET     Dashboard stats

/api/student/auth/login                  POST    Student login
/api/student/profile                     GET     Get profile
/api/student/payments                    GET     Payment history
/api/student/invoices                    GET     Invoice history