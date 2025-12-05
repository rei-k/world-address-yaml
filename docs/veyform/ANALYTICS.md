# Veyform Analytics API

## Overview

The Veyform Analytics system provides anonymized usage statistics to help site owners understand address form usage patterns and improve conversion rates.

## Features

- **Fully Anonymized**: No personal data or addresses stored
- **Real-time Tracking**: Events sent as they occur
- **Privacy-First**: GDPR/CCPA compliant
- **Aggregated Insights**: Data is aggregated for reporting

## Analytics Events

### Event Types

| Event | Description | Data Captured |
|-------|-------------|---------------|
| `country_selected` | User selects a country | country code, session ID, device type |
| `language_changed` | User switches language | old/new language, session ID |
| `continent_filter_used` | User clicks continent tab | continent, session ID |
| `field_focused` | User focuses on a field | field name, country |
| `field_completed` | User completes a field | field name, completion rate |
| `validation_failed` | Form validation fails | error count, field names |
| `validation_passed` | Form validation succeeds | completion time |
| `form_submitted` | User submits form | country, language, time taken |
| `form_abandoned` | User leaves without completing | last field, completion rate |

### Event Structure

```typescript
interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: string;  // ISO 8601
  data: {
    country?: string;
    language?: string;
    continent?: string;
    field?: string;
    validationErrors?: number;
    deviceType?: 'mobile' | 'desktop' | 'tablet';
    completionRate?: number;
  };
  sessionId: string;
  origin?: string;
}
```

## API Endpoint

### POST /api/analytics/events

Send analytics events to the server.

**Request:**

```http
POST /api/analytics/events HTTP/1.1
Host: api.vey.dev
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "type": "country_selected",
  "timestamp": "2024-12-05T10:30:00.000Z",
  "data": {
    "country": "JP",
    "deviceType": "mobile"
  },
  "sessionId": "veyform_1701772200000_abc123xyz",
  "origin": "https://example.com"
}
```

**Response:**

```http
HTTP/1.1 202 Accepted
Content-Type: application/json

{
  "status": "accepted",
  "eventId": "evt_1234567890"
}
```

## Reports API

### GET /api/analytics/reports/country-usage

Get country usage statistics.

**Request:**

```http
GET /api/analytics/reports/country-usage?period=30d HTTP/1.1
Host: api.vey.dev
Authorization: Bearer YOUR_API_KEY
```

**Response:**

```json
{
  "period": "30d",
  "totalSelections": 15234,
  "countries": [
    {
      "code": "US",
      "name": "United States",
      "count": 6120,
      "percentage": 40.2
    },
    {
      "code": "JP",
      "name": "Japan",
      "count": 4570,
      "percentage": 30.0
    },
    {
      "code": "KR",
      "name": "South Korea",
      "count": 1523,
      "percentage": 10.0
    }
  ]
}
```

### GET /api/analytics/reports/language-usage

Get language switching statistics.

**Response:**

```json
{
  "period": "30d",
  "totalSwitches": 3421,
  "languages": [
    {
      "code": "en",
      "count": 1825,
      "percentage": 53.3
    },
    {
      "code": "ja",
      "count": 1122,
      "percentage": 32.8
    },
    {
      "code": "zh",
      "count": 474,
      "percentage": 13.9
    }
  ]
}
```

### GET /api/analytics/reports/completion-rate

Get form completion rate statistics.

**Response:**

```json
{
  "period": "30d",
  "totalStarted": 20000,
  "totalCompleted": 16500,
  "overallCompletionRate": 82.5,
  "byCountry": [
    {
      "code": "JP",
      "started": 6000,
      "completed": 5400,
      "completionRate": 90.0
    },
    {
      "code": "US",
      "started": 8000,
      "completed": 6800,
      "completionRate": 85.0
    }
  ],
  "dropOffPoints": [
    {
      "field": "postal_code",
      "dropOffRate": 12.3
    },
    {
      "field": "street_address",
      "dropOffRate": 8.7
    }
  ]
}
```

### GET /api/analytics/reports/validation-errors

Get validation error statistics.

**Response:**

```json
{
  "period": "30d",
  "totalErrors": 2341,
  "errorsByField": [
    {
      "field": "postal_code",
      "count": 892,
      "percentage": 38.1,
      "topErrors": [
        { "code": "invalid_format", "count": 654 },
        { "code": "required", "count": 238 }
      ]
    },
    {
      "field": "province",
      "count": 523,
      "percentage": 22.3,
      "topErrors": [
        { "code": "required", "count": 523 }
      ]
    }
  ],
  "errorsByCountry": [
    {
      "code": "US",
      "count": 982,
      "percentage": 41.9
    },
    {
      "code": "JP",
      "count": 623,
      "percentage": 26.6
    }
  ]
}
```

### GET /api/analytics/reports/device-distribution

Get device type distribution.

**Response:**

```json
{
  "period": "30d",
  "total": 20000,
  "devices": [
    {
      "type": "mobile",
      "count": 11000,
      "percentage": 55.0
    },
    {
      "type": "desktop",
      "count": 7500,
      "percentage": 37.5
    },
    {
      "type": "tablet",
      "count": 1500,
      "percentage": 7.5
    }
  ]
}
```

## Configuration

### Enable Analytics

```typescript
const veyform = createVeyform({
  apiKey: 'your-api-key',
  enableAnalytics: true,  // Enable tracking
  analyticsEndpoint: 'https://api.vey.dev/api/analytics/events',  // Optional custom endpoint
});
```

### Custom Analytics Endpoint

If you want to self-host analytics:

```typescript
const veyform = createVeyform({
  apiKey: 'your-api-key',
  enableAnalytics: true,
  analyticsEndpoint: 'https://your-domain.com/analytics',
});
```

## Privacy & Security

### Data Anonymization

- **No PII**: Personal Identifiable Information is never sent
- **No Addresses**: Raw address data is never included
- **Session IDs**: Random, non-traceable identifiers
- **Aggregation**: Data is aggregated before storage

### GDPR Compliance

- Users can opt-out via browser DNT settings
- Data retention: 90 days (configurable)
- Right to deletion supported
- No cross-site tracking

### Security

- HTTPS only
- API key authentication
- Rate limiting (1000 events/min)
- Input validation and sanitization

## Dashboard Access

Analytics dashboard available at: https://dashboard.vey.dev/analytics

Features:
- Real-time country selection map
- Language usage trends
- Completion rate graphs
- Drop-off funnel analysis
- Export to CSV/JSON

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| POST /events | 1000 events | 1 minute |
| GET /reports/* | 60 requests | 1 minute |

## Example Implementation

```typescript
import { createVeyform } from '@vey/core';

// Create instance with analytics enabled
const veyform = createVeyform({
  apiKey: process.env.VEYFORM_API_KEY,
  enableAnalytics: true,
  domainAutoDetect: true,
});

// Events are automatically tracked:
// - When user selects country
// - When user changes language
// - When validation fails
// - When form is submitted
// - When user abandons form

// Access reports via API
const response = await fetch('https://api.vey.dev/api/analytics/reports/country-usage?period=7d', {
  headers: {
    'Authorization': `Bearer ${process.env.VEYFORM_API_KEY}`
  }
});

const data = await response.json();
console.log('Top countries:', data.countries);
```

## Webhook Integration

Get notified when certain thresholds are reached:

```typescript
// Configure webhooks in dashboard
{
  "webhook": "https://your-site.com/webhooks/veyform",
  "events": [
    "completion_rate_drop",  // Triggered when rate drops below threshold
    "validation_errors_spike",  // Triggered when errors increase significantly
    "high_abandon_rate"  // Triggered when abandon rate exceeds threshold
  ]
}
```

## Support

For questions or issues with analytics:
- Email: analytics@vey.dev
- Documentation: https://vey.dev/docs/analytics
- Status page: https://status.vey.dev
