# OpenWeatherMap API Setup Guide

## Overview

The dashboard now integrates OpenWeatherMap API to display real-time weather information for Andong city (안동시) in English.

## Features

The "Today's Weather" card now displays:
- **Current Temperature** from OpenWeatherMap
- **Weather Description** (e.g., "clear sky", "light rain")
- **Weather Icon** from OpenWeatherMap
- **Wind Speed** in km/h
- **Cloudiness** percentage
- **Atmospheric Pressure** in hPa
- **Feels Like** temperature
- **City Name** (Andong-si)

## Setup Instructions

### 1. Get OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/)
2. Sign up for a free account
3. Navigate to **API keys** section in your account
4. Copy your API key

**Note**: Free tier includes:
- 60 calls/minute
- 1,000,000 calls/month
- Current weather data
- 3-hour forecast

### 2. Add API Key to Environment Variables

Update both `.env` and `.env.local` files:

```env
# OpenWeatherMap API Configuration
OPENWEATHERMAP_API_KEY=your_actual_api_key_here
```

**Important**: Replace `your_api_key_here` with your actual OpenWeatherMap API key.

### 3. Restart Development Server

After adding the API key, restart the development server:

```bash
# Stop current server (Ctrl+C)
npm run dev

# Or clean restart
npm run dev:clean
```

### 4. Verify Integration

1. Open http://localhost:3000
2. Check browser console for any errors
3. The "Today's Weather" card should display:
   - Weather icon and description
   - Current temperature from OpenWeatherMap
   - Wind speed, cloudiness, pressure, and feels like temperature

## API Details

- **Endpoint**: `/api/weather`
- **Location**: Andong city (안동시)
- **Coordinates**: Latitude 36.5684, Longitude 128.7294
- **Units**: Metric (Celsius, km/h)
- **Language**: English
- **Cache**: 15 minutes (900 seconds)
- **Refresh Interval**: Every 15 minutes
- **Update Frequency**: OpenWeatherMap updates data every 10 minutes

## Files Modified

1. **`app/api/weather/route.ts`** (new)
   - Server-side API route
   - Fetches weather data from OpenWeatherMap
   - Transforms and caches data

2. **`components/dashboard/EnvironmentCard.tsx`** (modified)
   - Removed "Feels Like" and "Comfort" calculated sections
   - Added OpenWeatherMap data display
   - Integrated weather icon and description
   - Shows real-time weather metrics

3. **`.env` and `.env.local`** (modified)
   - Added `OPENWEATHERMAP_API_KEY` variable

## Troubleshooting

### API Key Not Working

1. Verify the API key is correct
2. Check if the API key is activated (can take a few minutes)
3. Ensure environment variables are properly set
4. Restart the development server

### Weather Data Not Displaying

1. Open browser console (F12)
2. Check for error messages
3. Verify API route is accessible: http://localhost:3000/api/weather
4. Check if response contains weather data

### Error: "OpenWeatherMap API key not configured"

- The `OPENWEATHERMAP_API_KEY` environment variable is missing
- Add it to both `.env` and `.env.local` files
- Restart the server

### Error: 401 Unauthorized

- Invalid API key
- API key not activated yet (wait a few minutes after registration)
- Check for typos in the API key

## Vercel Deployment

For Vercel deployment, add the environment variable in Vercel dashboard:

1. Go to your project in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add `OPENWEATHERMAP_API_KEY` with your API key
4. Redeploy the application

## API Response Example

```json
{
  "temperature": 15,
  "description": "clear sky",
  "icon": "01d",
  "humidity": 65,
  "windSpeed": 12,
  "feelsLike": 14,
  "pressure": 1013,
  "cloudiness": 10,
  "city": "Andong-si"
}
```

## Cost Considerations

**Free Tier Limits**:
- Current implementation: ~96 calls/day (every 15 minutes)
- Well within free tier limits (1,000,000 calls/month)
- No cost for normal dashboard usage
- OpenWeatherMap recommends calling API no more than once every 10 minutes

## Notes

- Weather data is cached for 15 minutes to optimize API usage
- OpenWeatherMap updates their data every 10 minutes
- The component will show a loading state while fetching data
- If API fails, the card will still display temperature and humidity from MQTT sensors
- All weather information is displayed in English as requested
