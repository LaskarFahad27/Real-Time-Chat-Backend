# JWT Authentication Guide

## Overview
This application now supports JWT (JSON Web Token) authentication for secure user identification and authorization.

## How It Works

### 1. User Login
- **Endpoint**: `POST /api/students/login`
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "userpassword"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Login Successful",
    "data": {
      "id": 1,
      "name": "Student Name",
      "email": "user@example.com",
      "semester": "5th"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2. Using the Token
After login, include the JWT token in the Authorization header for protected routes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Protected Endpoints

#### Get All Students
- **Endpoint**: `GET /api/students/`
- **Headers**: `Authorization: Bearer <token>`

#### Get Student by ID
- **Endpoint**: `GET /api/students/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Get Current User Profile
- **Endpoint**: `GET /api/students/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Returns the logged-in user's profile data

#### Dashboard Access
- **Endpoint**: `GET /api/students/dashboard`
- **Headers**: `Authorization: Bearer <token>`

#### Check Auth Status
- **Endpoint**: `GET /api/students/auth/status`
- **Headers**: `Authorization: Bearer <token>`

## Token Details
- **Expiration**: 24 hours
- **Payload**: Contains user id, email, and name
- **Algorithm**: HS256

## Example Usage with JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('/api/students/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token;

// Store token (in localStorage, sessionStorage, or secure cookie)
localStorage.setItem('authToken', token);

// Use token for protected requests
const studentsResponse = await fetch('/api/students/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const students = await studentsResponse.json();
```

## Error Responses

### Missing Token
```json
{
  "success": false,
  "message": "Access token is missing"
}
```

### Invalid/Expired Token
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

## Security Notes
1. Store tokens securely (not in localStorage for production)
2. Implement token refresh mechanism for production
3. Always use HTTPS in production
4. Consider implementing logout functionality that invalidates tokens