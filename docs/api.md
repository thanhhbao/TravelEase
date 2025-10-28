# TravelEase API Documentation

## Authentication
All protected endpoints require Bearer token authentication via Sanctum.

## Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user (requires auth)
- `POST /api/forgot-password` - Request password reset
- `POST /api/reset-password` - Reset password
- `POST /api/email/verify-code` - Verify email with code
- `POST /api/email/verification-notification` - Send verification email (requires auth)

### User Profile
- `GET /api/user` - Get current user info (requires auth)
- `PUT /api/user/profile` - Update profile (requires auth)
- `POST /api/user/password/code` - Send password change code (requires auth)
- `POST /api/user/password` - Change password (requires auth)
- `POST /api/user/delete/code` - Send account deletion code (requires auth)
- `POST /api/user/delete` - Delete account (requires auth)

### Flights
- `GET /api/flights` - List flights with filters (optional query params: from_city, to_city, airline, class, min_price, max_price)
- `GET /api/flights/{id}` - Get flight details

### Hotels
- `GET /api/hotels` - List hotels with filters (optional query params: city, country, stars, min_price, max_price, name)
- `GET /api/hotels/{id}` - Get hotel details

### Bookings
- `GET /api/my-bookings` - Get user's bookings (requires auth)
- `POST /api/my-bookings` - Create booking (requires auth)
- `GET /api/my-bookings/{id}` - Get booking details (requires auth)
- `POST /api/my-bookings/{id}/cancel` - Cancel booking (requires auth)

### Tickets
- `GET /api/tickets` - Get user's tickets (requires auth)
- `GET /api/tickets/{id}` - Get ticket details (requires auth)
- `POST /api/tickets/{id}/cancel` - Cancel ticket (requires auth)

### Contact
- `POST /api/contact` - Send contact message
- `GET /api/contacts` - Get contact messages (requires auth, admin only)

## Request/Response Formats

### Flight Object
```json
{
  "id": 1,
  "airline": "Lufthansa",
  "flight_number": "L579",
  "logo": "https://...",
  "from_city": "New York",
  "to_city": "London",
  "departure_time": "2025-10-25T12:10:00.000Z",
  "arrival_time": "2025-10-25T14:59:00.000Z",
  "duration": "2h 49m",
  "stops": "Non-stop",
  "price": 231.00,
  "class": "Economy"
}
```

### Hotel Object
```json
{
  "id": 1,
  "name": "Grand Hotel",
  "description": "Luxury hotel...",
  "address": "123 Main St",
  "city": "Paris",
  "country": "France",
  "stars": 5,
  "price_per_night": 200.00,
  "amenities": ["WiFi", "Pool"],
  "images": ["url1", "url2"],
  "thumbnail": "url"
}
```

### Ticket Object
```json
{
  "id": 1,
  "user_id": 1,
  "flight_id": 1,
  "passengers": [
    {
      "name": "John Doe",
      "dateOfBirth": "1990-01-01",
      "passportNumber": "123456789"
    }
  ],
  "contact_email": "john@example.com",
  "contact_phone": "+1234567890",
  "total_price": 231.00,
  "status": "confirmed",
  "created_at": "2025-10-25T10:00:00.000000Z",
  "flight": {
    "id": 1,
    "airline": "Lufthansa",
    "flight_number": "L579",
    "from_city": "New York",
    "to_city": "London",
    "departure_time": "2025-10-25T12:10:00.000Z",
    "arrival_time": "2025-10-25T14:59:00.000Z"
  }
}
```

## Error Responses
```json
{
  "message": "Error description"
}
```

## Pagination
Paginated responses include:
```json
{
  "current_page": 1,
  "data": [...],
  "first_page_url": "...",
  "from": 1,
  "last_page": 1,
  "last_page_url": "...",
  "links": [...],
  "next_page_url": null,
  "path": "...",
  "per_page": 10,
  "prev_page_url": null,
  "to": 10,
  "total": 50
}
