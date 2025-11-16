/**
 * Hashing utilities for secure on-chain data storage
 *
 * SECURITY:
 * - Never store raw emails or student IDs on-chain
 * - Always hash PII before sending to Solana
 * - Use consistent salt for verification
 */

// Salt for hashing - In production, this should be an environment variable
const HASH_SALT = import.meta.env.VITE_HASH_SALT || 'badger-tutors-salt-2024';

/**
 * Generate a deterministic user ID from email using SHA-256
 *
 * @param email - Student email (e.g., student@wisc.edu)
 * @returns 32-byte hash as hex string
 */
export async function generateUserIdHash(email: string): Promise<string> {
  // Normalize email (lowercase, trim)
  const normalizedEmail = email.toLowerCase().trim();

  // Combine email with salt
  const message = normalizedEmail + HASH_SALT;

  // Convert to Uint8Array
  const msgBuffer = new TextEncoder().encode(message);

  // Hash using Web Crypto API (SHA-256)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Generate a student ID hash
 *
 * @param studentId - 10-digit student ID
 * @returns 32-byte hash as hex string
 */
export async function generateStudentIdHash(studentId: string): Promise<string> {
  const message = studentId + HASH_SALT;
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Convert hash hex string to Uint8Array (32 bytes) for Solana
 *
 * @param hashHex - Hex string from generateUserIdHash()
 * @returns Uint8Array of 32 bytes
 */
export function hashHexToBytes(hashHex: string): Uint8Array {
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    bytes[i] = parseInt(hashHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Verify if an email matches a stored hash
 *
 * @param email - Email to verify
 * @param storedHash - Hash from blockchain/database
 * @returns true if email matches hash
 */
export async function verifyEmailHash(email: string, storedHash: string): Promise<boolean> {
  const computedHash = await generateUserIdHash(email);
  return computedHash === storedHash;
}

/**
 * Generate a composite hash for registry lookup
 * Combines email hash + student ID hash for extra security
 *
 * @param email - Student email
 * @param studentId - Student ID
 * @returns Combined hash
 */
export async function generateRegistryHash(email: string, studentId: string): Promise<string> {
  const emailHash = await generateUserIdHash(email);
  const studentIdHash = await generateStudentIdHash(studentId);

  // Combine both hashes
  const combined = emailHash + studentIdHash;
  const msgBuffer = new TextEncoder().encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Example usage:
 *
 * // When registering a student on-chain:
 * const emailHash = await generateUserIdHash('student@wisc.edu');
 * const studentIdHash = await generateStudentIdHash('1234567890');
 * const registryHash = await generateRegistryHash('student@wisc.edu', '1234567890');
 *
 * // Send hashes to Solana smart contract (never raw email/ID)
 * await registerOnChain({
 *   userIdHash: hashHexToBytes(emailHash),
 *   registryHash: hashHexToBytes(registryHash),
 *   walletPublicKey: wallet.publicKey
 * });
 *
 * // Later, to verify a student:
 * const isValid = await verifyEmailHash(loginEmail, storedHashFromBlockchain);
 */
