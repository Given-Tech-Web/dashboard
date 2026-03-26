import { NextResponse } from 'next/server';

// Server-side only environment variables (remove NEXT_PUBLIC_ prefix)
const MQTT_CONFIG = {
  host: process.env.HIVEMQ_HOST || process.env.NEXT_PUBLIC_HIVEMQ_HOST,
  port: process.env.HIVEMQ_PORT || process.env.NEXT_PUBLIC_HIVEMQ_PORT,
  username: process.env.HIVEMQ_USERNAME || process.env.NEXT_PUBLIC_HIVEMQ_USERNAME,
  password: process.env.HIVEMQ_PASSWORD || process.env.NEXT_PUBLIC_HIVEMQ_PASSWORD,
};

export async function GET() {
  try {
    console.log('[API] MQTT Config check:', {
      hasHost: !!MQTT_CONFIG.host,
      hasPort: !!MQTT_CONFIG.port,
      hasUsername: !!MQTT_CONFIG.username,
      hasPassword: !!MQTT_CONFIG.password,
      host: MQTT_CONFIG.host?.substring(0, 10) + '...',
    });

    // Validate required configuration
    if (!MQTT_CONFIG.host || !MQTT_CONFIG.port || !MQTT_CONFIG.username || !MQTT_CONFIG.password) {
      console.error('[API] Missing MQTT configuration:', {
        host: MQTT_CONFIG.host,
        port: MQTT_CONFIG.port,
        username: MQTT_CONFIG.username,
        hasPassword: !!MQTT_CONFIG.password
      });
      return NextResponse.json(
        { error: 'MQTT configuration is incomplete' },
        { status: 500 }
      );
    }

    // Return sanitized configuration
    // In production, you might want to return a token instead of credentials
    return NextResponse.json({
      host: MQTT_CONFIG.host,
      port: parseInt(MQTT_CONFIG.port || '8884'),
      // For enhanced security, consider implementing a token-based system
      // where the client receives a temporary token instead of actual credentials
      credentials: {
        username: MQTT_CONFIG.username,
        password: MQTT_CONFIG.password,
      },
      // Additional configuration
      config: {
        reconnectPeriod: 5000,
        connectTimeout: 30000,
        clean: true,
        protocol: 'wss',
      }
    });
  } catch (error) {
    console.error('Error fetching MQTT config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch MQTT configuration' },
      { status: 500 }
    );
  }
}

// Optional: POST endpoint for token-based authentication
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { apiKey } = body;

    // Validate API key (implement your own validation logic)
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Generate temporary credentials or token
    // This is a placeholder - implement actual token generation
    const token = Buffer.from(JSON.stringify({
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      expires: Date.now() + 3600000, // 1 hour
    })).toString('base64');

    return NextResponse.json({
      token,
      host: MQTT_CONFIG.host,
      port: parseInt(MQTT_CONFIG.port || '8884'),
    });
  } catch (error) {
    console.error('Error generating MQTT token:', error);
    return NextResponse.json(
      { error: 'Failed to generate MQTT token' },
      { status: 500 }
    );
  }
}