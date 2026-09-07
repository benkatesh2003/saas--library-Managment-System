# Library Sathi — Entity Relationship Diagram

## Complete ER Diagram

```mermaid
erDiagram
    SuperAdmin {
        ObjectId _id PK
        String name
        String email UK
        String password
        String role "super-admin"
        Date createdAt
        Date updatedAt
    }

    Feature {
        ObjectId _id PK
        String name UK
        String code UK "FEAT-001"
        String description
        String type "basic | premium | addon"
        Number pricing_monthly
        Number pricing_yearly
        Number pricing_lifetime
        String image_url
        Boolean isActive
    }

    Plan {
        ObjectId _id PK
        String name UK
        String description
        Number pricing_monthly
        Number pricing_yearly
        Number pricing_lifetime
        Number discount_percentage "0-100"
        Date discount_validTill
        Number maxStudents "-1 = unlimited"
        Number maxSeats "-1 = unlimited"
        Boolean isActive
    }

    Subscription {
        ObjectId _id PK
        ObjectId adminId FK
        ObjectId planId FK
        String billingCycle "monthly | yearly | lifetime"
        Number totalAmount
        Number discount
        Number finalAmount
        String paymentStatus "created | pending | paid | failed | expired"
        String razorpayOrderId
        String razorpayPaymentId
        String razorpaySignature
        Date startDate
        Date endDate
        Boolean isActive
        Boolean autoRenew
    }

    Admin {
        ObjectId _id PK
        String libraryId UK "LIB-001"
        String firstName
        String lastName
        String email UK
        String password
        String phone
        String libraryName
        String address_street
        String address_city
        String address_state
        String address_pincode
        String googleId
        String avatar_url
        ObjectId subscriptionId FK
        String activeFeatures "feature codes array"
        Boolean isVerified
        Boolean isActive
        String role "admin"
        Date lastLogin
    }

    Student {
        ObjectId _id PK
        String studentId "STU-00001"
        ObjectId adminId FK
        String name
        String email
        String phone
        String password
        String image_url
        String address
        ObjectId seat_seatId FK
        ObjectId shift_shiftId FK
        ObjectId locker_lockerId FK
        Date subscription_startDate
        Date subscription_endDate
        Number subscription_duration
        String paymentStatus "due | partial | paid | advance"
        Boolean isActive
        Date admissionDate
    }

    Seat {
        ObjectId _id PK
        ObjectId adminId FK
        String seatNumber
        String floor "Ground"
        String section
        ObjectId reservedFor FK
        String status "available | occupied | maintenance | reserved"
    }

    Shift {
        ObjectId _id PK
        ObjectId adminId FK
        String name "Morning Shift"
        String startTime "06:00"
        String endTime "14:00"
        Number price
        Number maxStudents "-1 = unlimited"
        Number currentStudents
        Boolean isActive
    }

    Locker {
        ObjectId _id PK
        ObjectId adminId FK
        String lockerNumber
        String size "small | medium | large"
        Number price
        Boolean isOccupied
        ObjectId studentId FK
        String status "available | occupied | maintenance"
    }

    Book {
        ObjectId _id PK
        ObjectId adminId FK
        String title
        String author
        String ISBN
        String publisher
        String category
        Number totalCopies
        Number availableCopies
        String shelfLocation
        String image_url
    }

    BookIssue {
        ObjectId _id PK
        ObjectId adminId FK
        ObjectId bookId FK
        ObjectId studentId FK
        Date issueDate
        Date dueDate
        Date returnDate
        Number fine
        Number finePerDay
        String status "issued | returned | overdue | lost"
        String notes
    }

    StudentPayment {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId adminId FK
        Number shiftAmount
        Number lockerAmount
        Number additionalCharges
        Number totalAmount
        Number totalDiscount
        Number finalAmount
        Number amountPaid
        Number amountDue
        String paymentMethod "cash | upi | card | razorpay"
        String paymentStatus "due | partial | paid | advance | refunded"
        String razorpayOrderId
        String razorpayPaymentId
        Date paymentDate
        Date periodStart
        Date periodEnd
    }

    StudentInvoice {
        ObjectId _id PK
        String invoiceNumber UK "INV-YYYYMMDD-XXXXX"
        ObjectId studentId FK
        ObjectId adminId FK
        ObjectId paymentId FK
        String lineItems "description + amount array"
        Number totalPayable
        Number discount
        Number finalAmount
        Number amountPaidNow
        Number amountDue
        String paymentMethod
        Date generatedAt
    }

    %% ─── RELATIONSHIPS ───

    SuperAdmin ||--o{ Feature : "manages"
    SuperAdmin ||--o{ Plan : "creates"

    Plan }o--o{ Feature : "bundles"

    Plan ||--o{ Subscription : "selected in"
    Admin ||--o{ Subscription : "subscribes"
    Admin ||--|| Subscription : "active subscription"

    Subscription }o--o{ Feature : "custom add-ons"

    Admin ||--o{ Student : "admits"
    Admin ||--o{ Seat : "configures"
    Admin ||--o{ Shift : "defines"
    Admin ||--o{ Locker : "manages"
    Admin ||--o{ Book : "catalogs"
    Admin ||--o{ BookIssue : "tracks"
    Admin ||--o{ StudentPayment : "collects"
    Admin ||--o{ StudentInvoice : "generates"

    Student ||--o| Seat : "assigned"
    Student ||--o| Shift : "enrolled"
    Student ||--o| Locker : "allocated"
    Seat ||--o| Student : "reserved for"
    Locker ||--o| Student : "occupied by"

    Student ||--o{ StudentPayment : "pays"
    StudentPayment ||--o{ StudentInvoice : "invoiced"

    Student ||--o{ BookIssue : "borrows"
    Book ||--o{ BookIssue : "issued as"
```

---

## Relationship Summary

| Relationship | Type | Key |
|---|---|---|
| SuperAdmin → Feature | 1 : N | SuperAdmin manages features |
| SuperAdmin → Plan | 1 : N | SuperAdmin creates plans |
| Plan ↔ Feature | M : N | Plans bundle multiple features |
| Admin → Subscription | 1 : N | Admin can have subscription history |
| Plan → Subscription | 1 : N | Plan selected in subscriptions |
| Subscription ↔ Feature | M : N | Custom add-on features |
| **Admin → Student** | **1 : N** | **Tenant-scoped via `adminId`** |
| **Admin → Seat** | **1 : N** | **Tenant-scoped via `adminId`** |
| **Admin → Shift** | **1 : N** | **Tenant-scoped via `adminId`** |
| **Admin → Locker** | **1 : N** | **Tenant-scoped via `adminId`** |
| **Admin → Book** | **1 : N** | **Tenant-scoped via `adminId`** |
| Student → Seat | 1 : 0..1 | Optional seat assignment |
| Student → Shift | 1 : 0..1 | Optional shift enrollment |
| Student → Locker | 1 : 0..1 | Optional locker allocation |
| Student → StudentPayment | 1 : N | Multiple payment records |
| StudentPayment → StudentInvoice | 1 : N | Invoices per payment |
| Student → BookIssue | 1 : N | Multiple book borrows |
| Book → BookIssue | 1 : N | Multiple issue records |

> [!IMPORTANT]
> All **bold** relationships enforce **multi-tenant isolation** — every query on these entities MUST filter by `adminId` to prevent cross-library data leaks.
