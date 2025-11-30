# Event Management System - React.js

A comprehensive event management platform built with React.js, featuring event creation, registration, and analytics.

## Features

- 🔐 User authentication and authorization
- 📅 Event creation and management
- 📝 Event registration system
- 📊 Analytics dashboard with charts
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design

## Tech Stack

- **Frontend:** React.js 18
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **Charts:** Chart.js & React-Chartjs-2
- **Build Tool:** Vite
- **State Management:** React Context API

## Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd event-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional):
```env
VITE_API_BASE_URL=https://event--management.vercel.app/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── Layout.jsx
│   ├── Sidebar.jsx
│   └── PrivateRoute.jsx
├── pages/           # Page components
│   ├── Dashboard.jsx
│   ├── Events.jsx
│   ├── BrowseEvents.jsx
│   ├── CreateEvent.jsx
│   ├── Profile.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── context/         # React Context providers
│   └── AuthContext.jsx
├── services/        # API services
│   ├── apiService.js
│   └── authService.js
├── utils/           # Utility functions
│   └── config.js
├── App.jsx          # Main App component
├── main.jsx         # Entry point
└── index.css        # Global styles
```

## Features Overview

### Authentication
- User login and registration
- Protected routes
- JWT token management
- Persistent sessions

### Dashboard
- Statistics overview
- Event charts and analytics
- Recent events table
- Quick actions

### Event Management
- Create and manage events
- Publish or save as draft
- Event details and capacity
- Delete events

### Event Registration
- Browse published events
- Register for events
- View event details
- Check capacity

### Profile Management
- Update personal information
- Change password
- View account details

## API Integration

The application integrates with a backend API for:
- User authentication
- Event CRUD operations
- Registration management
- Analytics data

API configuration is managed in `src/utils/config.js`

## Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be in the `dist/` directory.

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API URL (default: https://event--management.vercel.app/api)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

ISC

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
