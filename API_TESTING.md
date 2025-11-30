# API Configuration & Testing Guide

## Current Backend API

**Base URL:** `https://event--management.vercel.app/api`

## API Endpoints

### Authentication Endpoints
- **Register:** `POST /users/register`
- **Login:** `POST /users/login`

### Testing the API

#### 1. Test API Connection (Manual)

Open your browser console (F12) and run:

```javascript
// Test if API is reachable
fetch('https://event--management.vercel.app/api/users/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log('✅ API Response:', data))
.catch(err => console.error('❌ API Error:', err));
```

#### 2. Using Docker Terminal

If you're running the app in Docker, test the API from the Docker terminal:

```bash
# Test API connection
curl -X GET https://event--management.vercel.app/api/users

# Test registration endpoint
curl -X POST https://event--management.vercel.app/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 3. Visual API Test Panel

The app now includes a visual API test panel in the bottom-right corner of the Login and Register pages that shows:
- Current API connection status
- API URL being used
- Any connection errors
- Quick recheck button

## Expected Responses

### Successful Registration (200 OK)
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "role": "user"
    }
  } }
  }
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error"
}
```

## Common Issues & Solutions

### Issue 1: CORS Error
**Error:** `Access to fetch has been blocked by CORS policy`

**Solution:** The backend API must have CORS enabled for your domain. Contact the backend team or check if the API is publicly accessible.

### Issue 2: Network Error
**Error:** `Failed to fetch` or `NetworkError`

**Possible Causes:**
1. **API is down** - Check if `https://event--management.vercel.app/api` is accessible
2. **Internet connection issue** - Verify your Docker container has internet access
3. **Firewall blocking** - Check Docker network settings

**Test Docker Internet:**
```bash
# From Docker terminal
curl https://www.google.com
curl https://event--management.vercel.app/api/users
```

### Issue 3: Wrong API URL
**Solution:** Update the `.env` file:

```env
VITE_API_BASE_URL=https://event--management.vercel.app/api
```

If using a different backend, change the URL accordingly.

## Configuring a Different API

If you need to use a different backend API:

1. **Update `.env` file:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
# or
VITE_API_BASE_URL=https://your-backend-url.com/api
```

2. **Restart Docker container** to pick up the new environment variable

3. **Verify the API URL** in the browser console:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL);
```

## Docker-Specific Configuration

If running in Docker, make sure your `docker-compose.yml` or `Dockerfile` includes:

```yaml
environment:
  - VITE_API_BASE_URL=https://event--management.vercel.app/api
```

Or pass it when running:
```bash
docker run -e VITE_API_BASE_URL=https://event--management.vercel.app/api your-image
```

## Debugging Tips

1. **Check browser console (F12)** - All API requests are now logged with emojis:
   - 🌐 Request being made
   - 📤 Request body
   - 📥 Response status
   - ✅ Success response
   - ❌ Error response

2. **Check Network tab** - See the actual HTTP requests and responses

3. **Use the API Test Panel** - Bottom-right corner shows real-time API status

## Backend API Expected Request Format
### Register
```json
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)"
}
```
```

### Login
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

## Contact

If the API is not working:
1. Verify the backend is deployed and running at `https://event--management.vercel.app/api`
2. Check if you have the correct API URL
3. Test with curl/Postman to isolate frontend issues
4. Check browser console for detailed error messages
