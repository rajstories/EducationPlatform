/**
 * Environment Variable Validation Utility
 * Validates that all required environment variables are set before starting the server
 */

interface EnvConfig {
    DATABASE_URL: string;
    SESSION_SECRET?: string;
    TWILIO_ACCOUNT_SID?: string;
    TWILIO_AUTH_TOKEN?: string;
    TWILIO_PHONE_NUMBER?: string;
    ADMIN_NOTIFICATION_PHONE?: string;
    NODE_ENV?: string;
    PORT?: string;
}

const requiredEnvVars = [
    'DATABASE_URL',
];

const recommendedEnvVars = [
    'SESSION_SECRET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
];

export function validateEnvironment(): EnvConfig {
    const missingRequired: string[] = [];
    const missingRecommended: string[] = [];

    // Check required variables
    for (const varName of requiredEnvVars) {
        if (!process.env[varName]) {
            missingRequired.push(varName);
        }
    }

    // Check recommended variables
    for (const varName of recommendedEnvVars) {
        if (!process.env[varName]) {
            missingRecommended.push(varName);
        }
    }

    // Error if required vars are missing
    if (missingRequired.length > 0) {
        console.error('\n❌ MISSING REQUIRED ENVIRONMENT VARIABLES:\n');
        missingRequired.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPlease create a .env file based on .env.example and fill in the required values.\n');
        process.exit(1);
    }

    // Warn if recommended vars are missing
    if (missingRecommended.length > 0) {
        console.warn('\n⚠️  MISSING RECOMMENDED ENVIRONMENT VARIABLES:\n');
        missingRecommended.forEach(varName => {
            console.warn(`   - ${varName}`);
        });
        console.warn('\nSome features may not work correctly. See .env.example for details.\n');
    }

    // Validate SESSION_SECRET is strong enough
    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
        console.warn('\n⚠️  WARNING: SESSION_SECRET should be at least 32 characters long for security.\n');
    }

    // Check if using default/weak session secret
    if (process.env.SESSION_SECRET?.includes('CHANGE') || process.env.SESSION_SECRET?.includes('your-')) {
        console.error('\n❌ ERROR: Please change the SESSION_SECRET in your .env file!\n');
        console.error('   Do not use the example value in production.\n');
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }

    console.log('✅ Environment validation passed\n');

    return {
        DATABASE_URL: process.env.DATABASE_URL!,
        SESSION_SECRET: process.env.SESSION_SECRET,
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
        ADMIN_NOTIFICATION_PHONE: process.env.ADMIN_NOTIFICATION_PHONE,
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || '5000',
    };
}
