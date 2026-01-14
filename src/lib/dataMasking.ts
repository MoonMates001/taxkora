/**
 * Client-side data masking utilities for displaying sensitive information
 */

// Mask email address (e.g., "jo**@example.com")
export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';
  
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return '****';
  
  const local = email.substring(0, atIndex);
  const domain = email.substring(atIndex);
  
  if (local.length <= 2) {
    return '**' + domain;
  }
  
  return local.substring(0, 2) + '*'.repeat(local.length - 2) + domain;
}

// Mask phone number (e.g., "******1234")
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Remove any formatting
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length <= 4) {
    return '*'.repeat(digits.length);
  }
  
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
}

// Mask TIN/Tax ID (e.g., "******1234")
export function maskTIN(tin: string | null | undefined): string {
  if (!tin) return '';
  
  if (tin.length <= 4) {
    return '*'.repeat(tin.length);
  }
  
  return '*'.repeat(tin.length - 4) + tin.slice(-4);
}

// Mask payment reference (e.g., "FLW***123")
export function maskPaymentRef(ref: string | null | undefined): string {
  if (!ref) return '';
  
  if (ref.length <= 6) {
    return '*'.repeat(ref.length);
  }
  
  return ref.slice(0, 3) + '*'.repeat(ref.length - 6) + ref.slice(-3);
}

// Mask bank account number (e.g., "******1234")
export function maskBankAccount(account: string | null | undefined): string {
  if (!account) return '';
  
  const digits = account.replace(/\D/g, '');
  
  if (digits.length <= 4) {
    return '*'.repeat(digits.length);
  }
  
  return '*'.repeat(digits.length - 4) + digits.slice(-4);
}

// Mask name (e.g., "John D.")
export function maskName(name: string | null | undefined): string {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  
  if (parts.length === 1) {
    if (parts[0].length <= 2) return parts[0];
    return parts[0].substring(0, 2) + '*'.repeat(parts[0].length - 2);
  }
  
  // Keep first name, mask rest
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0) + '.';
  
  return `${firstName} ${lastInitial}`;
}

// Mask address (keep city/state, hide street details)
export function maskAddress(address: string | null | undefined): string {
  if (!address) return '';
  
  // Just show first few characters and "..."
  if (address.length <= 10) return address;
  
  return address.substring(0, 8) + '...';
}

// Generic masking based on data type
export function maskSensitiveData(
  value: string | null | undefined,
  type: 'email' | 'phone' | 'tin' | 'payment_ref' | 'bank_account' | 'name' | 'address'
): string {
  if (!value) return '';
  
  switch (type) {
    case 'email':
      return maskEmail(value);
    case 'phone':
      return maskPhone(value);
    case 'tin':
      return maskTIN(value);
    case 'payment_ref':
      return maskPaymentRef(value);
    case 'bank_account':
      return maskBankAccount(value);
    case 'name':
      return maskName(value);
    case 'address':
      return maskAddress(value);
    default:
      return '*'.repeat(Math.min(value.length, 10));
  }
}
