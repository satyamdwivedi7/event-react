# Event Management System

A comprehensive event management platform built with HTML, Tailwind CSS, and JavaScript.

## Features

- 📊 **Dashboard** - Overview of events, participants, and revenue
- 🎫 **Event Management** - Create, edit, and manage events
- 👥 **Participant Management** - Track and manage event registrations
- 🔍 **Event Registration** - Browse and register for upcoming events
- 👤 **User Profile** - Manage account settings and preferences
- 🌙 **Dark Mode** - Beautiful dark theme throughout the application

## Tech Stack

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Charts**: Chart.js for data visualization
- **Authentication**: JWT-based authentication
- **API Integration**: RESTful API calls

## Deployment

This project is configured for easy deployment on Vercel.

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect the configuration and deploy

Or use the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Build Tailwind CSS:
```bash
npm run build
```

3. For development with auto-rebuild:
```bash
npm run dev
```

4. Open `index.html` in your browser or use a local server:
```bash
npx serve .
```

## Project Structure

```
├── src/
│   ├── *.html           # HTML pages
│   ├── input.css        # Tailwind CSS input
│   ├── output.css       # Compiled CSS (generated)
│   └── js/              # JavaScript modules
│       ├── api.js
│       ├── auth.js
│       ├── dashboard.js
│       └── ...
├── tailwind.config.js   # Tailwind configuration
├── package.json         # Dependencies and scripts
└── vercel.json         # Vercel deployment config
```

## Pages

- **Dashboard** (`index.html`) - Main dashboard with statistics
- **Events** (`events.html`) - Manage your events
- **Browse Events** (`browse-events.html`) - Register for events
- **Participants** (`registered-participants.html`) - View participants
- **Profile** (`profile.html`) - User account settings
- **Login/Register** - Authentication pages

## Environment Variables

Make sure to configure your API endpoint in `js/config.js`:

```javascript
export const API_BASE_URL = 'your-api-url';
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC
