/**
 * Environment Variable Validator
 * Validates required environment variables at runtime
 */

interface EnvConfig {
  // Server-side only (without NEXT_PUBLIC_ prefix for security)
  HIVEMQ_HOST?: string;
  HIVEMQ_PORT?: string;
  HIVEMQ_USERNAME?: string;
  HIVEMQ_PASSWORD?: string;

  // Legacy public variables (will be deprecated)
  NEXT_PUBLIC_HIVEMQ_HOST?: string;
  NEXT_PUBLIC_HIVEMQ_PORT?: string;
  NEXT_PUBLIC_HIVEMQ_USERNAME?: string;
  NEXT_PUBLIC_HIVEMQ_PASSWORD?: string;

  // Optional API key for enhanced security
  API_KEY?: string;

  // Vercel-specific
  VERCEL_ENV?: string;
  NODE_ENV?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: EnvConfig;
}

class EnvValidator {
  private requiredVars: string[] = [];
  private optionalVars: string[] = [];

  constructor() {
    // Define required variables based on environment
    if (typeof window === 'undefined') {
      // Server-side required variables
      this.requiredVars = [
        'HIVEMQ_HOST',
        'HIVEMQ_PORT',
        'HIVEMQ_USERNAME',
        'HIVEMQ_PASSWORD',
      ];
      this.optionalVars = ['API_KEY', 'VERCEL_ENV', 'NODE_ENV'];
    } else {
      // Client-side doesn't need direct access to these
      this.requiredVars = [];
      this.optionalVars = [];
    }
  }

  /**
   * Validate environment variables
   */
  public validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const config: EnvConfig = {};

    // Check for required variables
    for (const varName of this.requiredVars) {
      const value = this.getEnvVar(varName);
      if (!value) {
        // Check for legacy NEXT_PUBLIC_ prefix as fallback
        const legacyValue = this.getEnvVar(`NEXT_PUBLIC_${varName}`);
        if (legacyValue) {
          warnings.push(
            `Using legacy NEXT_PUBLIC_${varName}. Please update to ${varName} for better security.`
          );
          config[varName as keyof EnvConfig] = legacyValue;
        } else {
          errors.push(`Missing required environment variable: ${varName}`);
        }
      } else {
        config[varName as keyof EnvConfig] = value;
      }
    }

    // Check for optional variables
    for (const varName of this.optionalVars) {
      const value = this.getEnvVar(varName);
      if (value) {
        config[varName as keyof EnvConfig] = value;
      }
    }

    // Additional validation rules
    if (config.HIVEMQ_PORT) {
      const port = parseInt(config.HIVEMQ_PORT);
      if (isNaN(port) || port < 1 || port > 65535) {
        errors.push(`Invalid port number: ${config.HIVEMQ_PORT}`);
      }
    }

    // Check for security issues
    if (typeof window !== 'undefined') {
      // Client-side security checks
      if (process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD) {
        warnings.push(
          'MQTT credentials are exposed to the client. Consider using API route proxy for better security.'
        );
      }
    }

    // Environment-specific warnings
    const env = config.NODE_ENV || config.VERCEL_ENV || 'development';
    if (env === 'production' && !config.API_KEY) {
      warnings.push(
        'Running in production without API_KEY. Consider adding authentication for better security.'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      config,
    };
  }

  /**
   * Get environment variable value
   */
  private getEnvVar(name: string): string | undefined {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[name];
    }
    return undefined;
  }

  /**
   * Log validation results
   */
  public logResults(result: ValidationResult): void {
    if (!result.isValid) {
      console.error('❌ Environment validation failed:');
      result.errors.forEach(error => console.error(`  - ${error}`));
    }

    if (result.warnings.length > 0) {
      console.warn('⚠️ Environment validation warnings:');
      result.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    if (result.isValid && result.warnings.length === 0) {
      console.log('✅ Environment validation passed');
    }
  }

  /**
   * Get safe configuration for client use
   */
  public getSafeConfig(): Partial<EnvConfig> {
    const result = this.validate();

    // Return only safe configuration without sensitive data
    return {
      NODE_ENV: result.config.NODE_ENV,
      VERCEL_ENV: result.config.VERCEL_ENV,
      // Don't expose credentials to client
    };
  }

  /**
   * Throw error if validation fails (for critical failures)
   */
  public validateOrThrow(): EnvConfig {
    const result = this.validate();

    if (!result.isValid) {
      const errorMessage = `Environment validation failed:\n${result.errors.join('\n')}`;
      throw new Error(errorMessage);
    }

    // Log warnings but don't throw
    if (result.warnings.length > 0) {
      this.logResults(result);
    }

    return result.config;
  }
}

// Singleton instance
const envValidator = new EnvValidator();

// Auto-validate on module load (server-side only)
if (typeof window === 'undefined') {
  const result = envValidator.validate();

  // Log results in development
  if (process.env.NODE_ENV === 'development') {
    envValidator.logResults(result);
  }

  // Don't throw in production to avoid breaking the app
  // but log errors for monitoring
  if (!result.isValid && process.env.NODE_ENV === 'production') {
    console.error('Environment validation failed in production:', result.errors);
  }
}

export default envValidator;
export type { EnvConfig, ValidationResult };