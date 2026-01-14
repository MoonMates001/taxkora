/**
 * Client-side encryption utilities using Web Crypto API
 * Used for encrypting sensitive data before storing in the database
 */

// Generate a random encryption key (should be derived from user's password or stored securely)
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Export key to base64 for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import key from base64
export async function importKey(keyBase64: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt data
export async function encryptData(
  data: string,
  key: CryptoKey
): Promise<{ encryptedValue: string; iv: string }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(data)
  );
  
  return {
    encryptedValue: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

// Decrypt data
export async function decryptData(
  encryptedValue: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const decoder = new TextDecoder();
  const encryptedData = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
  const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivData },
    key,
    encryptedData
  );
  
  return decoder.decode(decrypted);
}

// Generate masked value for display
export function generateMaskedValue(value: string, type: 'email' | 'phone' | 'tin' | 'payment_ref'): string {
  if (!value) return '';
  
  switch (type) {
    case 'email': {
      const atIndex = value.indexOf('@');
      if (atIndex <= 0) return '****';
      const local = value.substring(0, atIndex);
      const domain = value.substring(atIndex);
      if (local.length <= 2) return '**' + domain;
      return local.substring(0, 2) + '*'.repeat(local.length - 2) + domain;
    }
    case 'phone': {
      if (value.length <= 4) return '*'.repeat(value.length);
      return '*'.repeat(value.length - 4) + value.slice(-4);
    }
    case 'tin': {
      if (value.length <= 4) return '*'.repeat(value.length);
      return '*'.repeat(value.length - 4) + value.slice(-4);
    }
    case 'payment_ref': {
      if (value.length <= 6) return '*'.repeat(value.length);
      return value.slice(0, 3) + '*'.repeat(value.length - 6) + value.slice(-3);
    }
    default:
      return '*'.repeat(value.length);
  }
}

// Derive encryption key from user ID (deterministic per user)
export async function deriveUserKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const salt = encoder.encode('taxkora-encryption-salt-v1');
  
  // Import userId as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(userId),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  
  // Derive AES key
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}
