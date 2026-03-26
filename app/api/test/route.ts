import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    // Server-side variables
    HIVEMQ_HOST: process.env.HIVEMQ_HOST,
    HIVEMQ_PORT: process.env.HIVEMQ_PORT,
    HIVEMQ_USERNAME: process.env.HIVEMQ_USERNAME,
    HIVEMQ_PASSWORD: process.env.HIVEMQ_PASSWORD ? '***SET***' : 'NOT SET',

    // Public variables
    NEXT_PUBLIC_HIVEMQ_HOST: process.env.NEXT_PUBLIC_HIVEMQ_HOST,
    NEXT_PUBLIC_HIVEMQ_PORT: process.env.NEXT_PUBLIC_HIVEMQ_PORT,
    NEXT_PUBLIC_HIVEMQ_USERNAME: process.env.NEXT_PUBLIC_HIVEMQ_USERNAME,
    NEXT_PUBLIC_HIVEMQ_PASSWORD: process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD ? '***SET***' : 'NOT SET',

    // Environment info
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  };

  console.log('[TEST API] Environment variables:', envVars);

  return NextResponse.json({
    message: 'Environment variables check',
    variables: envVars,
    hasAllRequired: !!(
      (process.env.HIVEMQ_HOST || process.env.NEXT_PUBLIC_HIVEMQ_HOST) &&
      (process.env.HIVEMQ_PORT || process.env.NEXT_PUBLIC_HIVEMQ_PORT) &&
      (process.env.HIVEMQ_USERNAME || process.env.NEXT_PUBLIC_HIVEMQ_USERNAME) &&
      (process.env.HIVEMQ_PASSWORD || process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD)
    ),
    timestamp: new Date().toISOString(),
  });
}