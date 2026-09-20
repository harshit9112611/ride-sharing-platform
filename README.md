# LNCTShares — College Ride-Sharing Platform

> A peer-to-peer ride-sharing web platform for college students that connects peers traveling on similar routes, reducing costs, easing campus transportation gaps, and promoting sustainable commuting.

**Live Demo:** [https://lnctshares.vercel.app](https://lnctshares.vercel.app)  
**Backend API:** [https://lnctshares-backend.onrender.com](https://lnctshares-backend.onrender.com)

---

## The Problem

Lakshmi Narain College of Technology (LNCT) runs its bus service only twice a day — at 3:30 PM and 5:30 PM. Outside these windows, students are forced to:

- Pay ₹150–500 per trip on commercial cabs (Uber/Ola)
- Travel alone, raising safety concerns
- Waste fuel and money on solo rides
- Coordinate rides chaotically via WhatsApp groups

## The Solution

LNCTShares provides a **verified, student-only** platform where students can:

- Post rides they're already taking (with vehicle details)
- Search rides by source, destination, and date
- See the actual route on a map with distance and drive time
- Book seats with a click
- Receive real-time notifications for new rides and bookings
- Set gender preferences for comfort

---

## Features

### Authentication
- College email registration with enrollment number
- Email verification via Brevo
- JWT-based sessions with auto-logout on token expiry
- BCrypt password hashing

### Ride Management
- Post rides with source, destination, date, time, and seats
- Support for free rides and fuel-sharing rides
- Optional vehicle linking
- Search rides with sort and filter
- Delete own rides (with safety checks)
- Interactive maps with real route visualization

### Booking System
- Request seats with confirmation modal
- Driver accept/reject workflow
- Booking history with cancel option
- Real-time notifications to drivers on new bookings
- Seat tracking with automatic availability updates

### Vehicle Management
- Add/edit/delete multiple vehicles per user
- Vehicle type, brand, model, color, plate
- Link vehicles to posted rides

### User Experience
- Responsive design (mobile, tablet, desktop)
- Loading skeletons and empty states
- Toast notifications for every action
- Gender preference filters
- Auto-logout on expired tokens

### Real-Time (WebSocket)
- New rides broadcast to all users on matching routes
- Booking requests pushed to drivers instantly
- STOMP over SockJS

### Public Stats
- Live counters for registered users, rides posted, bookings, and seats shared

---

## Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2.5**
- **Spring Security** + **JWT** (JJWT 0.12.5)
- **Spring Data JPA** + **Hibernate 6.4.4**
- **Spring WebSocket** (STOMP)
- **PostgreSQL** (production) / **H2** (local development)
- **Maven**
- **Brevo** for transactional email

### Frontend
- **React 18** + **Vite 5**
- **Tailwind CSS 3**
- **React Router DOM 6**
- **Axios** with JWT interceptors
- **Leaflet** + **react-leaflet** for maps
- **@stomp/stompjs** + **SockJS** for WebSockets
- **react-hot-toast** for notifications
- **Lucide React** for icons

### External APIs
- **Brevo** — email delivery (300/day free)
- **OSRM** — route calculation (free, no key)
- **OpenStreetMap** — map tiles

### Deployment
- **Vercel** — frontend hosting
- **Render** — backend hosting
- **Neon** — PostgreSQL (serverless)

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Browser (React 18 + Vite)              │
│  lnctshares.vercel.app                  │
└──────────────┬──────────────────────────┘
               │ HTTPS + WSS + JWT
               ▼
┌─────────────────────────────────────────┐
│  Spring Boot Backend                    │
│  lnctshares-backend.onrender.com        │
│  REST + WebSocket + JWT + Brevo         │
└──────────────┬──────────────────────────┘
               │ JDBC (PostgreSQL)
               ▼
┌─────────────────────────────────────────┐
│  PostgreSQL (Neon) — Singapore region   │
│  Tables: users, vehicles, rides, bookings│
└─────────────────────────────────────────┘
```

---

## Project Structure

```
ride-sharing-platform/
├── ridesharing/                      # Spring Boot backend
│   ├── src/main/java/com/college/ridesharing/
│   │   ├── config/                   # Security, JWT, WebSocket
│   │   ├── controller/               # REST endpoints
│   │   ├── dto/                      # Data transfer objects
│   │   ├── model/                    # JPA entities
│   │   ├── repository/               # JPA repositories
│   │   └── service/                  # Business logic
│   ├── src/main/resources/
│   │   ├── application.properties           # Shared config
│   │   ├── application-local.properties     # H2 (local dev)
│   │   └── application-prod.properties      # PostgreSQL (prod)
│   ├── Dockerfile
│   └── pom.xml
│
└── ridesharing-frontend/             # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── auth/                 # Login, Register, Verify
    │   │   ├── common/               # Navbar, Footer, EmptyState
    │   │   ├── layout/               # Layout wrapper
    │   │   └── rides/                # CreateRide, SearchRides, etc.
    │   ├── context/                  # AuthContext
    │   ├── hooks/                    # useAuth
    │   ├── pages/                    # Dashboard, Profile, MyRides
    │   ├── services/                 # api.js, auth.js, websocket.js
    │   ├── utils/                    # constants, validation, formatDate
    │   └── styles/                   # globals.css
    ├── public/
    │   └── logo.png
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Getting Started (Local Development)

### Prerequisites

- Java 17+
- Node.js 18+
- Maven (or use the `mvnw` wrapper)

### 1. Clone the repository

```bash
git clone https://github.com/harshit9112611/ride-sharing-platform.git
cd ride-sharing-platform
```

### 2. Set up the backend

```bash
cd ridesharing

# Set JAVA_HOME (Windows PowerShell)
$env:JAVA_HOME="C:\Program Files\Java\jdk-24"

# Optional — for email verification
$env:BREVO_API_KEY="xkeysib-your-key"

# Run with H2 (local profile)
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Backend starts at **http://localhost:8080**

### 3. Set up the frontend

```bash
cd ridesharing-frontend

# Create .env file
echo "VITE_API_URL=http://localhost:8080" > .env

# Install and run
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

### 4. Test the app

- Open http://localhost:5173
- Register a new user
- Login and explore

**H2 Console (local):** http://localhost:8080/h2-console  
JDBC URL: `jdbc:h2:file:./data/ridesharingdb` — User: `sa`, Password: (empty)

---

## Environment Variables

### Backend (Render)

| Variable | Purpose |
|----------|---------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | `5432` |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `BREVO_API_KEY` | Brevo API key |
| `JWT_SECRET` | JWT signing secret |
| `FRONTEND_URL` | Vercel URL for CORS |

### Frontend (Vercel)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend base URL |

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login, returns JWT |
| POST | `/verify-email` | No | Verify email with token |
| POST | `/resend-verification` | No | Resend verification email |
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update profile |
| GET | `/test` | No | Health check |

### Rides (`/api/rides`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Create a ride |
| GET | `/search` | No | Search rides |
| GET | `/my` | Yes | Get user's posted rides |
| GET | `/{id}` | No | Get ride details |
| DELETE | `/{id}` | Yes | Delete own ride |
| POST | `/{id}/book` | Yes | Book seats on ride |

### Bookings (`/api/bookings`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/my` | Yes | Get user's bookings |
| DELETE | `/{id}` | Yes | Cancel booking |
| GET | `/received` | Yes | Get received requests (driver) |

### Vehicles (`/api/vehicles`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Yes | Add vehicle |
| GET | `/my` | Yes | Get user's vehicles |
| PUT | `/{id}` | Yes | Update vehicle |
| DELETE | `/{id}` | Yes | Delete vehicle |

### Stats

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stats` | No | Public app statistics |

---

## Database Schema

Four main tables:

**users** — Student accounts with email verification, JWT auth, ratings  
**vehicles** — Vehicle details linked to owners  
**rides** — Posted rides with driver, vehicle, route, time  
**bookings** — Passenger bookings with seat counts

Relationships:
- User 1→N Vehicles
- User 1→N Rides (as driver)
- Ride 1→N Bookings
- User 1→N Bookings (as passenger)

---

## Screenshots

### Login
![Login](./screenshots/login.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Create Ride with Map
![Create Ride](./screenshots/create-ride.png)

### Search Rides
![Search Rides](./screenshots/search-rides.png)

### Ride Details
![Ride Details](./screenshots/ride-details.png)

*(Add screenshots to a `screenshots/` folder in your repo)*

---

## Future Scope

- [ ] Ratings and reviews system
- [ ] In-app chat between driver and passenger
- [ ] Ride reminders (email 1 hour before departure)
- [ ] Live GPS tracking
- [ ] Native mobile app (React Native)
- [ ] Payment integration (Razorpay/UPI)
- [ ] Admin panel for college administration
- [ ] Multi-college support
- [ ] AI-based route matching

---

## Known Limitations

- **Email verification**: Brevo's free tier only sends to verified sender emails. To send to any address, a domain must be verified (₹500/year).
- **Free-tier cold starts**: Render's free tier sleeps after 15 min of inactivity. First request after sleep takes ~30 seconds.
- **H2 vs PostgreSQL**: Local development uses H2; production uses PostgreSQL.

---

## Author

**Harshit Verma**  
B.Tech — Computer Science & Engineering  
Lakshmi Narain College of Technology, Bhopal  
Enrollment No: 0176CS241094  
GitHub: [@harshit9112611](https://github.com/harshit9112611)

---

## License

This project is developed as an academic project for LNCT. Free to use for educational purposes.

---

**Built with ❤️ for college students**