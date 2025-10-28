# TravelEase - Hotel & Flight Booking Platform

A modern, responsive travel booking platform built with React, TypeScript, and Tailwind CSS. Book hotels and flights with a beautiful, luxury-focused user interface.

## 🚀 Features

- **Hotel Booking**: Browse, search, and book hotels with detailed information
- **Flight Booking**: Search and book flights from multiple airlines
- **User Authentication**: Secure login/register system with protected routes
- **Dashboard**: Manage bookings, tickets, and profile
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Mock Data**: Complete frontend with realistic sample data
- **API Ready**: Easy switch to real backend by setting environment variable

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Routing**: React Router v6
- **State Management**: Zustand
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── layout/         # Navbar, Footer
│   ├── common/         # SearchBar, Pagination, etc.
│   ├── cards/          # HotelCard, FlightCard
│   └── modals/         # BookingModal, TicketModal
├── pages/              # Page components
│   ├── hotels/         # HotelsList, HotelDetail
│   ├── flights/        # FlightsSearch, FlightDetail
│   ├── auth/           # Login, Register
│   └── dashboard/      # Dashboard pages
├── services/           # API services
├── store/              # Zustand stores
└── styles/             # Global styles
```

## 🔧 Configuration

### Mock Data

The app uses mock JSON data located in `/public/mock/`:

- `hotels.json` - Sample hotel data
- `flights.json` - Sample flight data
- `bookings.json` - Sample booking data
- `tickets.json` - Sample ticket data

### API Integration

To connect to a real backend:

1. **Create environment file**

   ```bash
   cp env.example .env
   ```

2. **Set API base URL**

   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Update services**
   The service layer automatically switches between mock and real API based on the `VITE_API_BASE_URL` environment variable.

### Stripe Checkout

- The checkout page now uses Stripe Elements. Install dependencies with `npm install` after pulling the latest changes.
- No additional frontend environment variables are required; the backend returns the publishable key via `/api/payments/intent`.
- Ensure the Laravel backend is running with `STRIPE_SECRET` and `STRIPE_PUBLISHABLE_KEY` configured; otherwise the payment form will not load.

## 🎨 Design System

### Colors

- **Primary**: Gray-900 (#111827)
- **Secondary**: Gray-600 (#4B5563)
- **Accent**: Yellow-400 (#FBBF24)
- **Background**: Gray-50 (#F9FAFB)

### Typography

- **Hero**: text-5xl (48px)
- **Section Titles**: text-2xl (24px)
- **Body**: text-sm (14px)

### Components

- **Cards**: rounded-2xl, shadow-lg
- **Buttons**: Primary (black) and outline variants
- **Inputs**: Rounded with focus states
- **Animations**: Fade-up, slide-up, hover effects

## 🔐 Authentication

The app includes a complete authentication system:

- **Login/Register**: Mock authentication (accepts any credentials)
- **Protected Routes**: Dashboard requires authentication
- **Persistent Sessions**: User data stored in localStorage
- **Redirect Handling**: Returns to intended page after login

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation**: Collapsible mobile menu
- **Cards**: Responsive grid layouts
- **Forms**: Full-width on mobile, constrained on desktop

## 🎯 Key Features

### Hotel Booking Flow

1. Browse hotels on `/hotels`
2. Filter by location, price, stars
3. View details on `/hotels/:slug`
4. Book room (requires authentication)
5. Manage bookings in dashboard

### Flight Booking Flow

1. Search flights on `/flights`
2. Filter by route, date, airline
3. View details on `/flights/:id`
4. Book ticket with passenger details
5. Manage tickets in dashboard

### User Dashboard

- **My Bookings**: View and cancel hotel reservations
- **My Tickets**: View and cancel flight tickets
- **Profile**: Edit personal information

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel/Netlify

1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

## 🔄 API Integration

The service layer is designed for easy backend integration:

```typescript
// services/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Automatically switches between mock and real API
const response = await api.get("/api/hotels");
```

### Expected API Endpoints

- `GET /api/hotels` - List hotels
- `GET /api/hotels/:id` - Get hotel details
- `POST /api/bookings` - Create booking
- `GET /api/flights` - Search flights
- `POST /api/tickets` - Create ticket

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
