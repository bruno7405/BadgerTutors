# BadgerTutors - Security Implementation Guide
## Protecting Student PII with Hashing

**Last Updated:** November 16, 2025

---

## 🔐 Security Problem

**Issue:** Blockchain data is public. Anyone can read it.

**Risk:** If you store raw emails (`student@wisc.edu`) or student IDs (`1234567890`) on Solana, they become publicly visible forever.

**Solution:** Hash all PII before sending to blockchain.

---

## ✅ What I've Implemented

### **1. Hashing Utility (`src/lib/hashingUtils.ts`)**

Created a secure hashing library that:
- ✅ Uses SHA-256 (industry standard)
- ✅ Adds salt for extra security
- ✅ Generates deterministic hashes (same input = same hash)
- ✅ Cannot reverse the hash to get original data

### **2. Updated Solana Client (`src/lib/solanaClient.ts`)**

Modified to:
- ✅ Hash email before blockchain storage
- ✅ Hash student ID before blockchain storage
- ✅ Generate combined registry hash for verification
- ✅ Keep raw data in Supabase (private database)

---

## 📊 Data Flow Architecture

### **What Goes Where:**

| Data Type | Supabase (Private) | Solana Blockchain (Public) |
|-----------|-------------------|---------------------------|
| **Raw Email** | ✅ `student@wisc.edu` | ❌ NEVER |
| **Email Hash** | ❌ Not needed | ✅ `a3f8d9...` (64 chars) |
| **Raw Student ID** | ✅ `1234567890` | ❌ NEVER |
| **Student ID Hash** | ❌ Not needed | ✅ `7b2c1e...` (64 chars) |
| **Registry Hash** | ❌ Not needed | ✅ `9d5e3a...` (64 chars) |
| **Wallet Address** | ✅ Yes | ✅ Yes (public key, safe) |

---

## 🔄 Authentication Flow

### **Registration:**

```typescript
// 1. Student enters email + student ID in frontend
const email = "student@wisc.edu";
const studentId = "1234567890";

// 2. Frontend validates format
if (!email.endsWith("@wisc.edu")) throw new Error("Invalid email");
if (!/^\d{10}$/.test(studentId)) throw new Error("Invalid student ID");

// 3. Hash the PII
import { generateUserIdHash, generateRegistryHash } from '@/lib/hashingUtils';

const emailHash = await generateUserIdHash(email);
const registryHash = await generateRegistryHash(email, studentId);

// 4. Send to Solana (ONLY hashes, never raw data)
await solanaProgram.registerStudent({
  emailHash: hashHexToBytes(emailHash),  // 32 bytes
  registryHash: hashHexToBytes(registryHash),  // 32 bytes
  wallet: walletPublicKey  // Public key (safe to store)
});

// 5. Store raw data in Supabase (private database)
await supabase.from('profiles').insert({
  id: userId,
  email: email,  // Raw email (Supabase is private)
  student_id: studentId,  // Raw ID (Supabase is private)
  wallet_public_key: walletPublicKey
});
```

### **Login/Verification:**

```typescript
// 1. Student logs in with email
const loginEmail = "student@wisc.edu";

// 2. Hash the email (same hash as registration)
const emailHash = await generateUserIdHash(loginEmail);

// 3. Query Solana to verify
const onChainData = await solanaProgram.getStudentByHash(emailHash);

// 4. If hash matches, student is verified!
if (onChainData.emailHash === emailHash) {
  // Student is registered on-chain
  // Now fetch full profile from Supabase (private DB)
  const profile = await supabase
    .from('profiles')
    .select('*')
    .eq('email', loginEmail)
    .single();
}
```

---

## 🛠️ How to Use

### **Step 1: Environment Variable**

Add to your `.env` file:

```env
VITE_HASH_SALT=your-secret-salt-here-change-in-production
```

**Important:** In production, use a strong, random salt and keep it secret!

### **Step 2: Import Hashing Functions**

```typescript
import {
  generateUserIdHash,
  generateStudentIdHash,
  generateRegistryHash,
  hashHexToBytes,
  verifyEmailHash
} from '@/lib/hashingUtils';
```

### **Step 3: Use in Your Components**

#### **Example: Registration (Frontend)**

```typescript
// In your Profile.tsx or registration component
import { registerStudent } from '@/lib/solanaClient';

const handleRegister = async () => {
  const email = user.email; // From Supabase auth
  const studentId = formData.studentId; // From user input
  const wallet = walletAddress; // From wallet adapter

  // Call registerStudent - it handles hashing internally
  const result = await registerStudent(studentId, email, wallet);

  if (result.success) {
    toast.success(result.message);
    console.log("On-chain hash:", result.onChainHash);
  } else {
    toast.error(result.message);
  }
};
```

#### **Example: Verify User**

```typescript
// Verify if an email matches a stored hash
const storedHash = "a3f8d9e2..."; // From blockchain
const isValid = await verifyEmailHash("student@wisc.edu", storedHash);

if (isValid) {
  console.log("✅ Email verified!");
}
```

---

## 🔒 Security Benefits

### **1. Privacy Protection**
- ❌ No one can see raw emails on-chain
- ❌ No one can see student IDs on-chain
- ✅ Only hashed, unreadable data is public

### **2. Cannot Reverse**
- SHA-256 is one-way encryption
- Cannot convert hash back to email
- Even with the hash, attackers can't get original data

### **3. Deterministic Verification**
- Same email always produces same hash
- Can verify identity without exposing data
- Multiple verifications don't reveal new information

### **4. GDPR/Privacy Compliant**
- No PII stored on immutable blockchain
- Can comply with "right to be forgotten" (data only in Supabase)
- Meets data protection regulations

---

## 🧪 Testing the Hashing

### **Test in Browser Console:**

```javascript
// Open your app at http://localhost:8085
// Open browser console (F12)

// Test hashing
import { generateUserIdHash } from './src/lib/hashingUtils';

const hash1 = await generateUserIdHash("test@wisc.edu");
console.log("Hash 1:", hash1);

const hash2 = await generateUserIdHash("test@wisc.edu");
console.log("Hash 2:", hash2);

// Should be identical (deterministic)
console.log("Are hashes equal?", hash1 === hash2); // true

// Different email = different hash
const hash3 = await generateUserIdHash("different@wisc.edu");
console.log("Different email hash:", hash3);
console.log("Are they different?", hash1 !== hash3); // true
```

---

## 📝 Solana Smart Contract Integration

### **When you build your Solana program:**

```rust
// In your Anchor program (programs/badger-tutors/src/lib.rs)

use anchor_lang::prelude::*;

#[account]
pub struct StudentRegistry {
    pub email_hash: [u8; 32],      // Hashed email (SHA-256)
    pub registry_hash: [u8; 32],   // Combined hash (email + student ID)
    pub wallet: Pubkey,             // Wallet public key (safe to store)
    pub registration_time: i64,     // Timestamp
    pub is_verified: bool,          // Verification status
}

#[derive(Accounts)]
pub struct RegisterStudent<'info> {
    #[account(
        init,
        payer = student,
        space = 8 + 32 + 32 + 32 + 8 + 1,
        seeds = [b"student", email_hash.as_ref()],
        bump
    )]
    pub student_registry: Account<'info, StudentRegistry>,

    #[account(mut)]
    pub student: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn register_student(
    ctx: Context<RegisterStudent>,
    email_hash: [u8; 32],      // From frontend hashing
    registry_hash: [u8; 32]    // From frontend hashing
) -> Result<()> {
    let registry = &mut ctx.accounts.student_registry;

    // Store ONLY hashed data on-chain
    registry.email_hash = email_hash;
    registry.registry_hash = registry_hash;
    registry.wallet = ctx.accounts.student.key();
    registry.registration_time = Clock::get()?.unix_timestamp;
    registry.is_verified = true;

    msg!("Student registered with email hash: {:?}", &email_hash[..8]);

    Ok(())
}
```

### **Frontend calls this with:**

```typescript
import { hashHexToBytes, generateUserIdHash, generateRegistryHash } from '@/lib/hashingUtils';
import { PublicKey } from '@solana/web3.js';

const emailHash = await generateUserIdHash(email);
const registryHash = await generateRegistryHash(email, studentId);

const tx = await program.methods.registerStudent(
  Array.from(hashHexToBytes(emailHash)),  // Convert hex to [u8; 32]
  Array.from(hashHexToBytes(registryHash))
)
.accounts({
  studentRegistry: registryPda,
  student: wallet.publicKey,
  systemProgram: SystemProgram.programId
})
.rpc();
```

---

## ⚠️ Important Security Notes

### **DO:**
✅ Always hash PII before sending to Solana
✅ Store raw data in Supabase (private database)
✅ Use environment variable for salt
✅ Change salt in production (use strong random string)
✅ Log hashing actions for audit trail

### **DON'T:**
❌ Never send raw email to Solana
❌ Never send raw student ID to Solana
❌ Never hardcode salt in source code
❌ Never commit `.env` file to git
❌ Never share salt publicly

---

## 🚀 Next Steps

### **1. Test the Hashing (Now)**
```bash
# Open your app
http://localhost:8085

# Register with student ID
# Check browser console for hash logs
# You'll see: "🔐 Security: Hashing student data for on-chain storage"
```

### **2. Build Solana Smart Contract**
- Use the Rust code example above
- Store only hashed data on-chain
- Test with devnet before mainnet

### **3. Update Environment Variables**
```env
# .env (local development)
VITE_HASH_SALT=dev-salt-change-in-production

# .env.production (production)
VITE_HASH_SALT=super-secret-random-salt-generated-securely
```

### **4. Audit Your Code**
- Search codebase for any raw email/student ID sent to blockchain
- Ensure all Solana calls use hashed data
- Verify Supabase stores raw data (it's private)

---

## 📚 Additional Resources

### **Hashing Libraries:**
- **Web Crypto API** (what we're using) - Built into browsers
- **@noble/hashes** - If you need more algorithms
- **bcrypt** - For password hashing (different use case)

### **Solana Security:**
- [Solana Security Best Practices](https://docs.solana.com/developing/programming-model/security)
- [Anchor Security](https://www.anchor-lang.com/docs/security)

### **Privacy Regulations:**
- GDPR (EU)
- CCPA (California)
- FERPA (Student data - US)

---

## ✅ Implementation Checklist

- [x] Created `hashingUtils.ts` with SHA-256 hashing
- [x] Updated `solanaClient.ts` to use hashes
- [x] Added environment variable for salt
- [ ] Add salt to `.env` file
- [ ] Test hashing in browser console
- [ ] Build Solana smart contract with hash storage
- [ ] Deploy and test on Solana devnet
- [ ] Audit all blockchain calls for raw PII
- [ ] Change salt before production deployment
- [ ] Document hash generation in API docs

---

**🎯 Summary:** Your student emails and IDs are now hashed before going to Solana. Raw data stays in Supabase (private). Anyone viewing the blockchain only sees unreadable hashes!

**Need help?** Check the console logs when registering - you'll see the hashing in action! 🔐
