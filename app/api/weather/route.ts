import { NextResponse } from 'next/server';

// Andong city coordinates
const ANDONG_LAT = 36.5684;
const ANDONG_LON = 128.7294;

export async function GET() {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenWeatherMap API key not configured' },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${ANDONG_LAT}&lon=${ANDONG_LON}&appid=${apiKey}&units=metric`;

    const response = await fetch(url, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform data to required format
    const weatherData = {
      temperature: Math.round(data.main.temp),
      description: data.weather[0]?.description || 'N/A',
      icon: data.weather[0]?.icon || '01d',
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      feelsLike: Math.round(data.main.feels_like),
      pressure: data.main.pressure,
      cloudiness: data.clouds.all,
      city: data.name,
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
