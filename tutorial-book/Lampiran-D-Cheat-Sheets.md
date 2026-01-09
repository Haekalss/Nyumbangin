# LAMPIRAN D: CHEAT SHEETS

<div align="center">

**📝 Quick Reference Guide**

*Command reference untuk daily development*

</div>

---

## 📋 Table of Contents

1. [NPM Commands](#npm-commands)
2. [Git Commands](#git-commands)
3. [MongoDB Queries](#mongodb-queries)
4. [Mongoose Quick Reference](#mongoose-quick-reference)
5. [Midtrans Test Credentials](#midtrans-test-credentials)
6. [JWT Quick Reference](#jwt-quick-reference)
7. [Next.js Quick Reference](#nextjs-quick-reference)
8. [VS Code Shortcuts](#vs-code-shortcuts)

---

# NPM COMMANDS

## Project Setup
```bash
# Install dependencies
npm install

# Install specific package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Install globally
npm install -g package-name

# Uninstall package
npm uninstall package-name

# Update all packages
npm update

# Check outdated packages
npm outdated

# Security audit
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Fix lint errors
npm run lint -- --fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch
```

---

## Package Management
```bash
# List installed packages
npm list --depth=0

# Show package info
npm info package-name

# Clear npm cache
npm cache clean --force

# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

---

# GIT COMMANDS

## Basic Operations
```bash
# Initialize repository
git init

# Clone repository
git clone https://github.com/username/repo.git

# Check status
git status

# Add files
git add .                 # All files
git add file.js          # Specific file
git add src/             # Specific directory

# Commit changes
git commit -m "Commit message"

# Add and commit in one command
git commit -am "Message"

# Push to remote
git push origin main

# Pull from remote
git pull origin main

# View commit history
git log
git log --oneline        # Compact view
git log --graph          # Visual graph
```

---

## Branching
```bash
# List branches
git branch

# Create new branch
git branch feature-name

# Switch branch
git checkout feature-name

# Create and switch (shortcut)
git checkout -b feature-name

# Merge branch
git checkout main
git merge feature-name

# Delete branch
git branch -d feature-name
```

---

## Undoing Changes
```bash
# Discard changes in file
git checkout -- file.js

# Unstage file
git reset HEAD file.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert commit (create new commit)
git revert commit-hash
```

---

## Remote Operations
```bash
# View remotes
git remote -v

# Add remote
git remote add origin https://github.com/username/repo.git

# Change remote URL
git remote set-url origin https://new-url.git

# Fetch from remote
git fetch origin

# Pull with rebase
git pull --rebase origin main
```

---

# MONGODB QUERIES

## Connection
```bash
# Connect via mongosh
mongosh "mongodb://localhost:27017/nyumbangin"

# Connect to Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/nyumbangin"

# In MongoDB Compass
mongodb://localhost:27017
mongodb+srv://username:password@cluster.mongodb.net
```

---

## Database Operations
```javascript
// Show databases
show dbs

// Use database
use nyumbangin

// Show collections
show collections

// Drop database
db.dropDatabase()

// Create collection
db.createCollection('collectionName')
```

---

## CRUD Operations

### Find
```javascript
// Find all
db.creators.find()

// Find with filter
db.creators.find({ username: 'johndoe' })

// Find one
db.creators.findOne({ _id: ObjectId('...') })

// Find with specific fields
db.creators.find({}, { username: 1, displayName: 1 })

// Find with limit
db.donations.find().limit(10)

// Find with sort
db.donations.find().sort({ createdAt: -1 })

// Count documents
db.creators.countDocuments()
db.creators.countDocuments({ isActive: true })
```

---

### Insert
```javascript
// Insert one
db.creators.insertOne({
  username: 'johndoe',
  email: 'john@example.com',
  displayName: 'John Doe'
})

// Insert many
db.creators.insertMany([
  { username: 'user1', email: 'user1@example.com' },
  { username: 'user2', email: 'user2@example.com' }
])
```

---

### Update
```javascript
// Update one
db.creators.updateOne(
  { username: 'johndoe' },
  { $set: { bio: 'New bio text' } }
)

// Update many
db.donations.updateMany(
  { status: 'PENDING' },
  { $set: { status: 'FAILED' } }
)

// Increment field
db.creators.updateOne(
  { username: 'johndoe' },
  { $inc: { totalEarned: 50000 } }
)

// Push to array
db.creators.updateOne(
  { username: 'johndoe' },
  { $push: { badges: 'verified' } }
)
```

---

### Delete
```javascript
// Delete one
db.creators.deleteOne({ username: 'johndoe' })

// Delete many
db.donations.deleteMany({ status: 'FAILED' })

// Delete all documents in collection
db.donations.deleteMany({})
```

---

## Aggregation
```javascript
// Group by status and count
db.donations.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      total: { $sum: '$amount' }
    }
  }
])

// Lookup (join)
db.donations.aggregate([
  {
    $lookup: {
      from: 'creators',
      localField: 'creatorId',
      foreignField: '_id',
      as: 'creator'
    }
  }
])

// Match and sort
db.donations.aggregate([
  { $match: { status: 'PAID' } },
  { $sort: { createdAt: -1 } },
  { $limit: 10 }
])
```

---

## Indexes
```javascript
// List indexes
db.creators.getIndexes()

// Create index
db.creators.createIndex({ username: 1 })

// Create compound index
db.donations.createIndex({ creatorId: 1, status: 1 })

// Create unique index
db.creators.createIndex({ email: 1 }, { unique: true })

// Drop index
db.creators.dropIndex('username_1')
```

---

# MONGOOSE QUICK REFERENCE

## Schema Definition
```javascript
const CreatorSchema = new mongoose.Schema({
  // String
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  
  // Number
  totalEarned: {
    type: Number,
    default: 0,
    min: 0,
  },
  
  // Boolean
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Date
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  // Array
  badges: [String],
  
  // Nested object
  bankAccount: {
    bankName: String,
    accountNumber: String,
  },
  
  // Reference
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
  },
}, {
  timestamps: true, // Auto createdAt/updatedAt
});
```

---

## Query Methods
```javascript
// Find
await Model.find({ field: value })
await Model.findOne({ field: value })
await Model.findById(id)

// Create
await Model.create({ ... })
const doc = new Model({ ... })
await doc.save()

// Update
await Model.updateOne({ ... }, { $set: { ... } })
await Model.findByIdAndUpdate(id, { ... }, { new: true })

// Delete
await Model.deleteOne({ ... })
await Model.findByIdAndDelete(id)

// Count
await Model.countDocuments({ ... })
```

---

## Query Builders
```javascript
// Select fields
await Model.find().select('username email')
await Model.find().select('-password') // Exclude

// Sort
await Model.find().sort({ createdAt: -1 }) // Descending
await Model.find().sort('username') // Ascending

// Limit & Skip
await Model.find().limit(10).skip(20) // Pagination

// Populate
await Model.find().populate('creatorId')
await Model.find().populate('creatorId', 'username displayName')

// Lean (return plain objects)
await Model.find().lean()

// Exec (execute query)
await Model.find().exec()
```

---

## Aggregation
```javascript
await Model.aggregate([
  { $match: { status: 'PAID' } },
  { $group: { _id: '$creatorId', total: { $sum: '$amount' } } },
  { $sort: { total: -1 } },
  { $limit: 10 },
])
```

---

# MIDTRANS TEST CREDENTIALS

## Test Cards (Sandbox)

### Success Payment
```
Card Number:  4811 1111 1111 1114
Expiry:       01/25 (any future date)
CVV:          123
3D Secure:    112233
```

### Challenge by FDS
```
Card Number:  4911 1111 1111 1113
Expiry:       01/25
CVV:          123
```

### Denied by Bank
```
Card Number:  4611 1111 1111 1112
Expiry:       01/25
CVV:          123
```

---

## GoPay (Sandbox)
```
Phone:        Use any phone number
OTP:          Leave blank or any number
PIN:          123456
```

---

## Bank Transfer (Sandbox)

### BCA Virtual Account
```
VA Number: Will be generated
Status:    Auto-success after 5 minutes
```

### Permata Virtual Account
```
VA Number: Will be generated
Status:    Auto-success after 5 minutes
```

---

## Test Amounts (Special Behavior)

```javascript
// Auto-success
amount: 10000

// Auto-pending
amount: 20000

// Auto-deny
amount: 30000

// Challenge
amount: 40000
```

---

## Webhook Testing

### Manual Trigger
```bash
curl -X POST http://localhost:3000/api/webhook/midtrans \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_status": "settlement",
    "order_id": "TRX-1234567890-ABC",
    "gross_amount": "50000.00",
    "payment_type": "gopay",
    "status_code": "200",
    "signature_key": "..."
  }'
```

---

# JWT QUICK REFERENCE

## Generate Token
```javascript
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { 
    id: user._id, 
    email: user.email, 
    role: 'creator' 
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

---

## Verify Token
```javascript
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('User:', decoded);
} catch (error) {
  console.error('Invalid token:', error.message);
}
```

---

## Decode Without Verification
```javascript
const decoded = jwt.decode(token);
console.log('Expires:', new Date(decoded.exp * 1000));
```

---

## Generate Secret
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

---

# NEXT.JS QUICK REFERENCE

## File-Based Routing

```
pages/
  index.js              → /
  about.js              → /about
  donate/
    [username].js       → /donate/johndoe
  api/
    stats.js            → /api/stats
    creator/
      [username].js     → /api/creator/johndoe
```

---

## Data Fetching

### getServerSideProps (SSR)
```javascript
export async function getServerSideProps(context) {
  const data = await fetchData();
  return { props: { data } };
}
```

### getStaticProps (SSG)
```javascript
export async function getStaticProps() {
  const data = await fetchData();
  return { 
    props: { data },
    revalidate: 60, // ISR: revalidate every 60s
  };
}
```

### Client-Side Fetching
```javascript
import useSWR from 'swr';

const { data, error } = useSWR('/api/stats', fetcher);
```

---

## API Routes
```javascript
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Handle POST
    return res.status(201).json({ success: true });
  }
  
  if (req.method === 'GET') {
    // Handle GET
    return res.status(200).json({ data: [] });
  }
  
  // Method not allowed
  return res.status(405).end();
}
```

---

## Dynamic Imports
```javascript
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});
```

---

## Environment Variables
```javascript
// Server-side only
process.env.JWT_SECRET

// Available in browser (must start with NEXT_PUBLIC_)
process.env.NEXT_PUBLIC_API_URL
```

---

## Image Optimization
```javascript
import Image from 'next/image';

<Image
  src="/profile.jpg"
  alt="Profile"
  width={100}
  height={100}
  priority={true} // For LCP images
/>
```

---

## Link Component
```javascript
import Link from 'next/link';

<Link href="/about">
  <a>About</a>
</Link>

// Dynamic route
<Link href={`/donate/${username}`}>
  <a>Donate</a>
</Link>
```

---

# VS CODE SHORTCUTS

## General
```
Ctrl+P          → Quick Open (files)
Ctrl+Shift+P    → Command Palette
Ctrl+B          → Toggle Sidebar
Ctrl+`          → Toggle Terminal
Ctrl+,          → Settings
```

---

## Editing
```
Ctrl+D          → Select next occurrence
Ctrl+Shift+L    → Select all occurrences
Alt+Click       → Multiple cursors
Ctrl+/          → Toggle comment
Ctrl+Shift+K    → Delete line
Alt+Up/Down     → Move line up/down
Shift+Alt+Down  → Copy line down
Ctrl+Space      → Trigger suggestions
```

---

## Navigation
```
Ctrl+G          → Go to line
Ctrl+Shift+O    → Go to symbol
Ctrl+Click      → Go to definition
Alt+Left/Right  → Navigate back/forward
Ctrl+Tab        → Switch between files
```

---

## Search
```
Ctrl+F          → Find
Ctrl+H          → Replace
Ctrl+Shift+F    → Search in files
Ctrl+Shift+H    → Replace in files
```

---

## Terminal
```
Ctrl+Shift+`    → New terminal
Ctrl+Shift+5    → Split terminal
```

---

## Git (with GitLens extension)
```
Ctrl+Shift+G    → Source Control
Ctrl+Shift+P → "Git: Commit"
Ctrl+Shift+P → "Git: Push"
```

---

## Useful Extensions

```bash
# Install via command line
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension eamodio.gitlens
code --install-extension bradlc.vscode-tailwindcss
code --install-extension mongodb.mongodb-vscode
code --install-extension rangav.vscode-thunder-client
```

---

## React/Next.js Snippets

```javascript
// Type these in .js/.jsx files:

rfc      → React Functional Component
rafce    → Arrow Function Component with export
useS     → useState hook
useE     → useEffect hook
```

---

## Custom User Snippets

Go to: File → Preferences → User Snippets → javascript.json

```json
{
  "Console Log": {
    "prefix": "clg",
    "body": ["console.log('$1', $1);"],
    "description": "Console log with label"
  },
  "Try Catch": {
    "prefix": "tryc",
    "body": [
      "try {",
      "  $1",
      "} catch (error) {",
      "  console.error('Error:', error);",
      "}"
    ]
  }
}
```

---

## Debugging

### Launch Configuration (.vscode/launch.json)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## Useful Commands

```bash
# Reload window
Ctrl+Shift+P → "Developer: Reload Window"

# Clear console
Ctrl+Shift+P → "Terminal: Clear"

# Format document
Shift+Alt+F

# Organize imports
Shift+Alt+O
```

---

<div align="center">

**Navigasi**

[⬅️ Lampiran C: Troubleshooting](Lampiran-C-Troubleshooting.md) | [Lampiran E: Glossary ➡️](Lampiran-E-Glossary.md)

</div>
