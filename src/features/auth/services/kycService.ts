/**
 * KYC (Know Your Customer) Verification Service
 * Stub implementation for mobile app signup flow
 *
 * In production, this would integrate with:
 * - Identity verification providers (Plaid IDV, Alloy, Persona)
 * - OFAC/sanctions screening
 * - Credit bureau checks
 * - Document verification services
 */

import { SignupData, KYCVerificationResult, KYCTier, KYCStatus } from '../types/kyc';

class KYCService {
  private readonly SIMULATED_DELAY_MS = 1500;

  /**
   * Verify user KYC information
   * Stub implementation that simulates verification
   */
  async verifyKYC(data: SignupData): Promise<KYCVerificationResult> {
    // Simulate API call delay
    await this.simulateDelay();

    // Validate required fields
    const validation = this.validateRequiredFields(data);
    if (!validation.valid) {
      return {
        success: false,
        tier: 'tier1',
        status: 'requires_info',
        message: validation.message,
        missingFields: validation.missingFields,
      };
    }

    // Simulate KYC checks
    const checks = await this.runKYCChecks(data);

    if (!checks.passed) {
      return {
        success: false,
        tier: 'tier1',
        status: 'rejected',
        message: checks.reason || 'Verification failed. Please contact support.',
      };
    }

    // Generate user ID
    const userId = this.generateUserId();

    // Determine KYC tier based on information provided
    const tier = this.determineTier(data);

    return {
      success: true,
      tier,
      status: 'approved',
      userId,
      message: `Account verified at ${tier === 'tier1' ? 'Tier 1' : 'Tier 2'} level`,
    };
  }

  /**
   * Check if email is already registered
   * Stub implementation
   */
  async checkEmailAvailability(email: string): Promise<{ available: boolean; message?: string }> {
    await this.simulateDelay(500);

    // Simulate some emails being taken
    const takenEmails = ['test@test.com', 'demo@demo.com', 'admin@swipesavvy.com'];

    if (takenEmails.includes(email.toLowerCase())) {
      return {
        available: false,
        message: 'This email is already registered',
      };
    }

    return { available: true };
  }

  /**
   * Check if phone number is already registered
   * Stub implementation
   */
  async checkPhoneAvailability(phone: string): Promise<{ available: boolean; message?: string }> {
    await this.simulateDelay(500);

    // Simulate some phones being taken
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone === '5551234567') {
      return {
        available: false,
        message: 'This phone number is already registered',
      };
    }

    return { available: true };
  }

  /**
   * Validate SSN format (last 4 digits)
   * Stub implementation
   */
  validateSSN(ssn: string): { valid: boolean; message?: string } {
    const cleanSSN = ssn.replace(/\D/g, '');

    if (cleanSSN.length !== 4) {
      return {
        valid: false,
        message: 'Please enter the last 4 digits of your SSN',
      };
    }

    // Check for invalid patterns
    if (['0000', '1234', '9999'].includes(cleanSSN)) {
      return {
        valid: false,
        message: 'Invalid SSN. Please check and try again.',
      };
    }

    return { valid: true };
  }

  /**
   * Validate address using USPS API
   * Stub implementation
   */
  async validateAddress(address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }): Promise<{
    valid: boolean;
    standardized?: typeof address;
    message?: string;
  }> {
    await this.simulateDelay(800);

    // Basic validation
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      return {
        valid: false,
        message: 'Please provide a complete address',
      };
    }

    // ZIP code format check
    if (!/^\d{5}$/.test(address.zipCode)) {
      return {
        valid: false,
        message: 'Please enter a valid 5-digit ZIP code',
      };
    }

    // Return standardized address (stub - in reality would call USPS API)
    return {
      valid: true,
      standardized: {
        street: address.street.toUpperCase(),
        city: address.city.toUpperCase(),
        state: address.state.toUpperCase(),
        zipCode: address.zipCode,
      },
    };
  }

  /**
   * Request KYC tier upgrade
   * Stub implementation for upgrading from Tier 1 to Tier 2/3
   */
  async requestTierUpgrade(
    userId: string,
    documentType: 'drivers_license' | 'passport' | 'state_id',
    documentData: { front: string; back?: string }
  ): Promise<{
    success: boolean;
    newTier?: KYCTier;
    status: KYCStatus;
    message: string;
  }> {
    await this.simulateDelay(2000);

    // Simulate document verification (would use IDV provider in production)
    const documentValid = Math.random() > 0.1; // 90% success rate

    if (!documentValid) {
      return {
        success: false,
        status: 'rejected',
        message: 'Document verification failed. Please ensure the image is clear and try again.',
      };
    }

    return {
      success: true,
      newTier: 'tier2',
      status: 'approved',
      message: 'Your account has been upgraded to Tier 2! You can now send up to $5,000/day.',
    };
  }

  /**
   * Get current KYC status for user
   * Stub implementation
   */
  async getKYCStatus(userId: string): Promise<{
    tier: KYCTier;
    status: KYCStatus;
    limits: {
      dailySend: number;
      dailyReceive: number;
      monthlyTotal: number;
    };
    upgradeAvailable: boolean;
  }> {
    await this.simulateDelay(300);

    // Return mock status (in production, would fetch from backend)
    return {
      tier: 'tier1',
      status: 'approved',
      limits: {
        dailySend: 500,
        dailyReceive: 10000,
        monthlyTotal: 5000,
      },
      upgradeAvailable: true,
    };
  }

  // Private helper methods

  private validateRequiredFields(data: SignupData): {
    valid: boolean;
    message?: string;
    missingFields?: string[];
  } {
    const missing: string[] = [];

    if (!data.personal.firstName) missing.push('firstName');
    if (!data.personal.lastName) missing.push('lastName');
    if (!data.personal.email) missing.push('email');
    if (!data.personal.phone) missing.push('phone');
    if (!data.personal.dateOfBirth) missing.push('dateOfBirth');
    if (!data.address.street) missing.push('street');
    if (!data.address.city) missing.push('city');
    if (!data.address.state) missing.push('state');
    if (!data.address.zipCode) missing.push('zipCode');
    if (!data.identity.ssn) missing.push('ssn');
    if (!data.password) missing.push('password');

    if (missing.length > 0) {
      return {
        valid: false,
        message: 'Please complete all required fields',
        missingFields: missing,
      };
    }

    return { valid: true };
  }

  private async runKYCChecks(data: SignupData): Promise<{
    passed: boolean;
    reason?: string;
  }> {
    // Simulate various KYC checks

    // 1. Age verification (must be 18+)
    const age = this.calculateAge(data.personal.dateOfBirth);
    if (age < 18) {
      return {
        passed: false,
        reason: 'You must be 18 or older to create an account',
      };
    }

    // 2. Email format check
    if (!this.isValidEmail(data.personal.email)) {
      return {
        passed: false,
        reason: 'Please provide a valid email address',
      };
    }

    // 3. SSN validation
    const ssnCheck = this.validateSSN(data.identity.ssn);
    if (!ssnCheck.valid) {
      return {
        passed: false,
        reason: ssnCheck.message,
      };
    }

    // 4. Simulated OFAC/sanctions check (stub - always passes for demo)
    // In production, would call OFAC screening service

    // 5. Simulated fraud check (stub - always passes for demo)
    // In production, would use fraud detection service

    return { passed: true };
  }

  private determineTier(data: SignupData): KYCTier {
    // Tier 1: Basic info (name, email, phone, SSN last 4)
    // Tier 2: + Government ID verification
    // Tier 3: + Enhanced due diligence (high net worth)

    // For initial signup with just last 4 SSN, assign Tier 1
    if (!data.identity.documentType) {
      return 'tier1';
    }

    // If government ID provided, could be Tier 2
    return 'tier2';
  }

  private generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `user_${timestamp}${random}`;
  }

  private calculateAge(dateString: string): number {
    const parts = dateString.split('/');
    if (parts.length !== 3) return 0;

    const birthDate = new Date(
      parseInt(parts[2]),
      parseInt(parts[0]) - 1,
      parseInt(parts[1])
    );
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private simulateDelay(ms: number = this.SIMULATED_DELAY_MS): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const kycService = new KYCService();
