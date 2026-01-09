# LAMPIRAN E: GLOSSARY

<div align="center">

**📖 Istilah & Definisi**

*Kamus teknis untuk memahami terminologi di buku ini*

</div>

---

## A

**Aggregation Pipeline**  
Serangkaian operasi MongoDB untuk memproses data dan mengembalikan hasil terkomputasi. Contoh: menghitung total donasi per creator.

**API (Application Programming Interface)**  
Interface yang memungkinkan dua aplikasi berkomunikasi. Dalam project ini, RESTful API untuk operasi CRUD.

**API Route**  
File dalam `pages/api/` yang menjadi endpoint HTTP. Next.js otomatis meng-handle routing.

**Authentication**  
Proses memverifikasi identitas user (siapa Anda?). Di project ini menggunakan JWT.

**Authorization**  
Proses memverifikasi permission user (apa yang boleh Anda lakukan?). Contoh: hanya admin yang bisa approve payout.

---

## B

**bcrypt**  
Library untuk hashing password dengan salt. Lebih aman dari MD5/SHA1 karena slow by design.

**Bearer Token**  
Format authorization header: `Authorization: Bearer <token>`. Token dikirim di setiap request ke protected routes.

---

## C

**Client Key (Midtrans)**  
Public key untuk Snap.js di frontend. Aman untuk di-expose ke browser.

**CORS (Cross-Origin Resource Sharing)**  
Mekanisme keamanan browser yang membatasi request dari domain berbeda. Biasanya tidak masalah jika frontend dan API satu domain.

**CRUD**  
Create, Read, Update, Delete - operasi dasar database.

**CSR (Client-Side Rendering)**  
Rendering halaman di browser dengan JavaScript. Opposite dari SSR.

---

## D

**Development Environment**  
Setup untuk coding (localhost, sandbox keys, test database). Berbeda dari production.

**Dynamic Route**  
Route dengan parameter variabel. Contoh: `/donate/[username].js` match `/donate/johndoe`.

---

## E

**Environment Variable**  
Konfigurasi yang disimpan di [`.env.local`](.env.local), tidak di-commit ke Git. Contoh: `JWT_SECRET`, `MONGO_URI`.

**Express.js**  
Framework Node.js untuk membuat server HTTP. Next.js API routes mirip Express middleware.

---

## F

**FDS (Fraud Detection System)**  
Sistem Midtrans untuk mendeteksi transaksi mencurigakan. Bisa challenge atau reject payment.

**Frontend**  
Bagian aplikasi yang dilihat user (UI). Dalam project ini: React components di `src/app/` dan `src/components/`.

---

## G

**getServerSideProps**  
Next.js function untuk fetch data di server setiap request (SSR).

**getStaticProps**  
Next.js function untuk fetch data saat build time (SSG).

---

## H

**Hash**  
Output dari fungsi hashing (one-way encryption). Digunakan untuk password dan signature verification.

**Hydration**  
Proses Next.js meng-attach JavaScript ke server-rendered HTML untuk membuatnya interaktif.

---

## I

**Index (Database)**  
Struktur data yang mempercepat query. Seperti index di buku. Contoh: index di `username` mempercepat `find({ username: 'johndoe' })`.

**ISR (Incremental Static Regeneration)**  
Next.js feature untuk re-generate static pages secara incremental (gabungan SSG + SSR).

---

## J

**JWT (JSON Web Token)**  
Standard untuk authorization token. Format: `header.payload.signature`. Self-contained (tidak perlu query database untuk verify).

---

## L

**lean()**  
Mongoose method untuk return plain JavaScript object (bukan Mongoose document). Lebih cepat untuk read-only queries.

**Localhost**  
Address loopback (127.0.0.1 atau `localhost`) untuk development server di komputer sendiri.

---

## M

**Middleware**  
Function yang run sebelum route handler. Contoh: authentication middleware untuk verify JWT sebelum akses protected route.

**Migration**  
Proses mengubah database schema (add/remove fields). MongoDB (schemaless) tidak strict butuh migration.

**Mongoose**  
ODM (Object Document Mapper) untuk MongoDB di Node.js. Menyediakan schema, validation, dan query builder.

---

## N

**NextAuth.js**  
Library authentication untuk Next.js dengan support OAuth providers (Google, GitHub, etc).

**Next.js**  
React framework dengan fitur SSR, SSG, file-based routing, API routes.

**Nodemailer**  
Library Node.js untuk mengirim email via SMTP.

---

## O

**OAuth**  
Protocol untuk authorization. Contoh: "Sign in with Google" tanpa share password ke aplikasi kita.

**ODM (Object Document Mapper)**  
Layer antara app code dan database (seperti ORM untuk NoSQL). Contoh: Mongoose.

**Order ID**  
Unique identifier untuk transaksi. Format di project: `TRX-{timestamp}-{random}`.

---

## P

**Payload (JWT)**  
Bagian tengah JWT yang berisi data (claims). Contoh: `{ id, email, role }`. **Not encrypted**, jangan simpan data sensitif!

**Populate (Mongoose)**  
Method untuk replace ObjectId reference dengan actual document. Seperti SQL JOIN.

**Production Environment**  
Setup untuk live app (real domain, production keys, production database).

---

## Q

**Query Parameter**  
Data di URL setelah `?`. Contoh: `/api/donations?page=2&limit=10`.

---

## R

**Rate Limiting**  
Membatasi jumlah request dari satu user/IP dalam periode waktu. Mencegah abuse/DDoS.

**Revalidate**  
Next.js ISR feature untuk update cached page setelah interval tertentu.

**Role-Based Access Control (RBAC)**  
Authorization model berdasarkan role user. Contoh: `creator` vs `admin`.

---

## S

**Salt (bcrypt)**  
Random string yang ditambahkan ke password sebelum hashing. Mencegah rainbow table attacks.

**Sandbox (Midtrans)**  
Testing environment dengan fake payments. Keys dimulai dengan `SB-`.

**Schema (Mongoose)**  
Definisi structure document di MongoDB. Mirip table definition di SQL.

**Server Key (Midtrans)**  
Secret key untuk API calls dari backend. **Jangan expose ke frontend!**

**Server-Side Rendering (SSR)**  
Rendering halaman di server (Node.js) sebelum dikirim ke browser. Next.js support SSR via `getServerSideProps`.

**Signature (Midtrans)**  
Hash untuk verify authenticity webhook. Computed dari `orderId+statusCode+grossAmount+serverKey`.

**SMTP (Simple Mail Transfer Protocol)**  
Protocol untuk mengirim email. Butuh SMTP server (Gmail, SendGrid, AWS SES).

**Snap (Midtrans)**  
Midtrans payment UI (popup atau redirect). User pilih payment method dan complete payment di sini.

**SSG (Static Site Generation)**  
Pre-render pages saat build time. Super cepat karena serve static HTML.

**SSR (Server-Side Rendering)**  
Render pages on-demand di server untuk setiap request. Slower dari SSG, tapi data always fresh.

---

## T

**Tailwind CSS**  
Utility-first CSS framework. Styling dengan class langsung di HTML. Contoh: `<div className="bg-blue-500 text-white p-4">`.

**Token (JWT)**  
String panjang hasil encoding payload + signature. Dikirim di header `Authorization: Bearer <token>`.

**Transaction Status (Midtrans)**  
Status payment: `pending`, `settlement`, `deny`, `cancel`, `expire`. Received via webhook.

**TypeScript**  
Superset JavaScript dengan static typing. Opsional untuk project ini (pakai JavaScript).

---

## U

**URI (Uniform Resource Identifier)**  
String yang identify resource. Contoh: `mongodb+srv://...` (MongoDB connection string).

**URL (Uniform Resource Locator)**  
Subset dari URI. Web address. Contoh: `https://nyumbangin.com/donate/johndoe`.

**useEffect**  
React Hook untuk side effects (fetch data, subscribe, update DOM, etc). Runs setelah render.

**useState**  
React Hook untuk local component state. Returns `[value, setValue]`.

---

## V

**Validation**  
Proses check apakah input data valid. Contoh: email format benar, password min 8 chars, amount > 10000.

**Vercel**  
Platform deployment untuk Next.js (by creators of Next.js). Free tier available.

**Virtual Account (VA)**  
Nomor rekening virtual dari bank untuk payment. User transfer ke VA, auto-detected oleh Midtrans.

---

## W

**Webhook**  
HTTP callback untuk event notification. Midtrans kirim POST request ke `/api/webhook/midtrans` setelah payment status berubah.

**Whitelist (MongoDB Atlas)**  
Daftar IP address yang boleh connect ke database. Untuk development bisa `0.0.0.0/0` (all IPs), production harus specific IPs.

---

## Acronyms & Abbreviations

| Acronym | Full Form | Meaning |
|---------|-----------|---------|
| API | Application Programming Interface | Interface untuk komunikasi antar aplikasi |
| CORS | Cross-Origin Resource Sharing | Keamanan browser untuk restrict cross-domain requests |
| CRUD | Create, Read, Update, Delete | Operasi database dasar |
| CSR | Client-Side Rendering | Render di browser dengan JS |
| DNS | Domain Name System | System untuk translate domain ke IP |
| FDS | Fraud Detection System | Sistem deteksi fraud Midtrans |
| HTML | HyperText Markup Language | Markup language untuk web pages |
| HTTP | HyperText Transfer Protocol | Protocol untuk web communication |
| HTTPS | HTTP Secure | HTTP dengan SSL/TLS encryption |
| ISR | Incremental Static Regeneration | Next.js feature untuk update static pages |
| JSON | JavaScript Object Notation | Format data interchange |
| JWT | JSON Web Token | Standard untuk auth tokens |
| MVC | Model-View-Controller | Software architecture pattern |
| NPM | Node Package Manager | Package manager untuk Node.js |
| ODM | Object Document Mapper | Mapper untuk NoSQL databases |
| ORM | Object-Relational Mapping | Mapper untuk SQL databases |
| RBAC | Role-Based Access Control | Authorization berdasarkan role |
| REST | Representational State Transfer | Architecture style untuk APIs |
| SDK | Software Development Kit | Tools untuk developers |
| SEO | Search Engine Optimization | Optimisasi untuk search engines |
| SMTP | Simple Mail Transfer Protocol | Protocol untuk email |
| SPF | Sender Policy Framework | Email authentication method |
| SQL | Structured Query Language | Language untuk relational databases |
| SSG | Static Site Generation | Pre-render pages saat build |
| SSR | Server-Side Rendering | Render pages di server |
| TLS | Transport Layer Security | Encryption protocol (successor SSL) |
| UI | User Interface | Visual part yang dilihat user |
| URI | Uniform Resource Identifier | Identifier untuk resources |
| URL | Uniform Resource Locator | Web address |
| UX | User Experience | Overall experience menggunakan app |
| VA | Virtual Account | Nomor rekening virtual untuk payment |

---

## Technical Terms (Indonesian - English)

| Indonesian | English | Explanation |
|------------|---------|-------------|
| Autentikasi | Authentication | Verifikasi identitas user |
| Otorisasi | Authorization | Verifikasi permission user |
| Basis data | Database | Sistem penyimpanan data terstruktur |
| Donatur | Donor/Supporter | Orang yang memberi donasi |
| Formulir | Form | Input form di web |
| Konfigurasi | Configuration | Setting/pengaturan aplikasi |
| Kredensial | Credentials | Login info (username/password) |
| Lintas-domain | Cross-domain | Request ke domain berbeda |
| Migrasi | Migration | Perubahan database schema |
| Notifikasi | Notification | Alert/pemberitahuan |
| Pencairan dana | Payout/Withdrawal | Transfer uang ke creator |
| Pengembangan | Development | Proses coding/building app |
| Pengguna | User | Orang yang pakai aplikasi |
| Penyedia | Provider | Service provider (OAuth, SMTP, etc) |
| Permintaan | Request | HTTP request ke server |
| Produksi | Production | Live environment (bukan testing) |
| Respons | Response | HTTP response dari server |
| Rute | Route | URL path yang di-handle app |
| Sandbox | Sandbox | Testing environment (not real) |
| Server | Server | Komputer yang serve aplikasi |
| Tanda tangan | Signature | Hash untuk verify authenticity |
| Token | Token | String untuk authentication |
| Validasi | Validation | Proses check data validity |
| Webhook | Webhook | HTTP callback untuk notifications |

---

## Status Values

### Donation Status
- `PENDING` - Payment belum complete
- `PAID` - Payment berhasil (settlement)
- `FAILED` - Payment gagal (deny/cancel/expire)

### Payout Status
- `PENDING` - Request belum di-review admin
- `APPROVED` - Admin approve, akan diproses
- `PROCESSED` - Uang sudah ditransfer
- `REJECTED` - Admin reject request

### Transaction Status (Midtrans)
- `pending` - Payment initiated, belum complete
- `settlement` - Payment berhasil
- `deny` - Ditolak bank/card issuer
- `cancel` - User cancel payment
- `expire` - Payment expired (tidak diselesaikan)
- `refund` - Payment di-refund

---

## Common Patterns

### CRON Expression
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0=Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)

Examples:
0 2 * * *    → Daily at 2:00 AM
0 0 * * 0    → Weekly on Sunday at midnight
0 0 1 * *    → Monthly on 1st at midnight
*/5 * * * *  → Every 5 minutes
```

### HTTP Status Codes
```
2xx - Success
200 OK
201 Created
204 No Content

3xx - Redirection
301 Moved Permanently
302 Found
304 Not Modified

4xx - Client Errors
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
405 Method Not Allowed
409 Conflict
429 Too Many Requests

5xx - Server Errors
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

### RegEx Patterns
```javascript
// Email
/^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Username (alphanumeric + underscore, 3-20 chars)
/^[a-zA-Z0-9_]{3,20}$/

// Indonesian phone number
/^(08|62)[0-9]{8,11}$/

// Strong password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

// URL
/^https?:\/\/.+/
```

---

## File Extensions

| Extension | Type | Description |
|-----------|------|-------------|
| `.js` | JavaScript | JavaScript file |
| `.jsx` | JavaScript | JavaScript with JSX (React) |
| `.ts` | TypeScript | TypeScript file |
| `.tsx` | TypeScript | TypeScript with JSX |
| `.json` | JSON | Data format file |
| `.md` | Markdown | Documentation file |
| `.env` | Environment | Environment variables |
| `.gitignore` | Git | Files to ignore in Git |
| `.css` | CSS | Stylesheet |
| `.html` | HTML | Web page markup |

---

## Next.js Special Files

| File | Purpose |
|------|---------|
| `page.js` | Route page (App Router) |
| `layout.js` | Shared layout (App Router) |
| `loading.js` | Loading UI |
| `error.js` | Error boundary |
| `not-found.js` | 404 page |
| `route.js` | API route (App Router) |
| `middleware.js` | Global middleware |
| `_app.js` | Custom App (Pages Router) |
| `_document.js` | Custom Document (Pages Router) |

---

## MongoDB Operators

### Query Operators
```javascript
$eq     // Equal
$ne     // Not equal
$gt     // Greater than
$gte    // Greater than or equal
$lt     // Less than
$lte    // Less than or equal
$in     // In array
$nin    // Not in array
$or     // Logical OR
$and    // Logical AND
$not    // Logical NOT
```

### Update Operators
```javascript
$set        // Set field value
$unset      // Remove field
$inc        // Increment number
$push       // Add to array
$pull       // Remove from array
$addToSet   // Add to array if not exists
```

### Aggregation Operators
```javascript
$match      // Filter documents
$group      // Group by field
$sort       // Sort documents
$limit      // Limit results
$skip       // Skip documents
$lookup     // Join collections
$project    // Select fields
$sum        // Sum values
$avg        // Average
$count      // Count documents
```

---

<div align="center">

**Navigasi**

[⬅️ Lampiran D: Cheat Sheets](Lampiran-D-Cheat-Sheets.md) | [Latihan & Studi Kasus ➡️](Latihan-Studi-Kasus.md)

---

**Catatan**: Glossary ini mencakup istilah teknis yang digunakan di buku tutorial ini. Untuk referensi lebih lengkap, silakan rujuk dokumentasi official masing-masing teknologi.

</div>
