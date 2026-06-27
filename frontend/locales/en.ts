export const en = {
  common: {
    navbar: {
      home: "Home",
      flights: "Flights",
      hotels: "Hotels",
      bookings: "Bookings",
      dashboard: "Dashboard",
      profile: "Profile",
      login: "Login",
      register: "Register",
      logout: "Logout",
      notifications: "Notifications",
      markAllRead: "Mark all as read",
      clearAll: "Clear all",
      noNotifications: "No notifications",
      confirmClear: "Clear all notifications? 🧹",
      start: "Get Started"
    },
    footer: {
      description: "Book flights and hotels at the best prices. Secure payments, instant confirmation, and 24/7 support.",
      rights: "© {year} FlightHotel. All rights reserved."
    },
    roles: {
      ADMIN: "Admin",
      HOTEL_MANAGER: "Hotel Manager",
      FLIGHT_MANAGER: "Flight Manager",
      CLIENT: "Client"
    },
    status: {
      SCHEDULED: "Scheduled",
      BOARDING: "Boarding",
      DEPARTED: "Departed",
      ARRIVED: "Arrived",
      CANCELLED: "Cancelled",
      DELAYED: "Delayed",
      CONFIRMED: "Confirmed",
      PENDING: "Pending",
      PAID: "Paid",
      REFUNDED: "Refunded",
      FAILED: "Failed"
    },
    loading: "Loading...",
    submitting: "Processing...",
    cancel: "Cancel",
    save: "Save Changes",
    actions: "Actions",
    back: "Back"
  },
  home: {
    hero: {
      title: "Your Journey Starts Here",
      subtitle: "Discover the best deals on flights and hotels worldwide.",
      searchFlights: "Search Flights",
      searchHotels: "Search Hotels"
    },
    searchForm: {
      from: "From",
      fromPlaceholder: "Origin city",
      to: "To",
      toPlaceholder: "Destination",
      date: "Date",
      passengers: "Passengers",
      search: "Search",
      city: "City",
      cityPlaceholder: "Destination city",
      checkIn: "Check-in",
      checkOut: "Check-out",
      guests: "Guests"
    },
    features: {
      bestPrice: "Best Price Guarantee",
      bestPriceDesc: "Find a lower price? We'll match it and give you an extra discount.",
      support: "24/7 Support",
      supportDesc: "Our dedicated support team is always here to assist you during your travels.",
      booking: "Easy Booking",
      bookingDesc: "Reserve flights and hotels in just a few clicks with secure payments."
    }
  },
  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to manage your bookings and profile",
      email: "Email address",
      password: "Password",
      button: "Sign In",
      noAccount: "Don't have an account?",
      signUp: "Sign up",
      forgotPass: "Forgot password?",
      success: "Logged in successfully! 👋",
      error: "Invalid credentials"
    },
    register: {
      title: "Create Account",
      subtitle: "Join us to start booking flights and hotels",
      firstName: "First name",
      lastName: "Last name",
      phone: "Phone number",
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm password",
      button: "Sign Up",
      haveAccount: "Already have an account?",
      signIn: "Sign in",
      success: "Registration successful! 🎉",
      error: "Registration failed"
    },
    forgot: {
      title: "Forgot Password",
      subtitle: "Enter your email to receive a password reset link",
      email: "Email address",
      button: "Send reset link",
      backToLogin: "Back to login",
      success: "Reset link sent! Check your inbox.",
      error: "Failed to send reset link"
    },
    reset: {
      title: "Reset Password",
      subtitle: "Enter and confirm your new password below",
      password: "New password",
      confirm: "Confirm new password",
      button: "Reset Password",
      success: "Password reset successfully! 🎉",
      error: "Failed to reset password"
    }
  },
  flights: {
    search: {
      title: "Search Flights",
      results: "{count} flights found",
      searching: "Searching...",
      pricePerPerson: "per person",
      noFlights: "No flights found",
      noFlightsDesc: "Try adjusting your search criteria",
      seatsLeft: "{count} seats left"
    },
    filters: {
      title: "Filters",
      priceRange: "Price Range",
      min: "Min",
      max: "Max",
      airline: "Airline",
      allAirlines: "All Airlines",
      clear: "Clear filters"
    }
  },
  hotels: {
    search: {
      title: "Search Hotels",
      results: "{count} hotels found",
      searching: "Searching...",
      pricePerNight: "from {price}/night",
      onRequest: "Rooms on request",
      noHotels: "No hotels found",
      noHotelsDesc: "Try adjusting your search criteria",
      roomsCount: "{count} rooms"
    },
    filters: {
      title: "Filters",
      stars: "Stars",
      anyStars: "Any Stars",
      andUp: "& up",
      pricePerNight: "Price per night",
      clear: "Clear filters"
    }
  },
  profile: {
    title: "My Profile",
    subtitle: "Manage your personal information",
    personalInfo: "Personal Info",
    firstName: "First name",
    lastName: "Last name",
    email: "Email address",
    phone: "Phone number",
    role: "User Role",
    memberSince: "Member since",
    editBtn: "Edit Profile",
    cancelBtn: "Cancel",
    saveBtn: "Save Changes",
    success: "Profile updated successfully! 🎉",
    error: "Failed to update profile"
  },
  reservations: {
    title: "My Bookings",
    subtitle: "Manage your flight and hotel reservations",
    flightsTab: "Flights",
    hotelsTab: "Hotels",
    empty: "No reservations found",
    emptyDesc: "Start exploring flights and hotels to make a booking!",
    flightCard: {
      seats: "Seats: {count}",
      class: "Class: {class}",
      amount: "Amount",
      download: "Download Ticket",
      cancel: "Cancel Flight"
    },
    hotelCard: {
      room: "Room {roomNumber} ({type})",
      checkIn: "Check-in",
      checkOut: "Check-out",
      amount: "Amount",
      download: "Download Voucher",
      cancel: "Cancel Booking"
    },
    cancellation: {
      confirm: "Are you sure you want to cancel this booking?",
      success: "Reservation cancelled successfully! 💸",
      error: "Failed to cancel reservation"
    }
  },
  payment: {
    title: "Complete Payment",
    summary: "Booking Summary",
    secure: "Secure Payment",
    ssl: "256-bit SSL",
    methodCard: "💳 Card",
    methodPaypal: "🅿️ PayPal",
    cardHolder: "Card Holder Name",
    cardNumber: "Card Number",
    expiryMonth: "Month",
    expiryYear: "Year",
    cvv: "CVV",
    simulated: "⚠️ Simulated payment — use any valid card number format",
    payBtn: "Pay {amount}",
    payNow: "Pay Now",
    success: {
      title: "Payment Successful!",
      transaction: "Transaction ID",
      instruction: "Check your email for your {type}.",
      boardingPass: "boarding pass",
      voucher: "hotel voucher",
      downloadBtn: "Download PDF",
      viewBookings: "View Bookings",
      toast: "Payment successful! 🎉"
    },
    errors: {
      fields: "Please fill all payment fields",
      failed: "Payment failed"
    }
  },
  dashboard: {
    admin: {
      title: "Dashboard",
      welcome: "Welcome back, {name} — {role}",
      users: "Total Users",
      bookings: "Total Bookings",
      revenue: "Total Revenue",
      activeFlights: "Active Flights",
      recentFlights: "Recent Flight Bookings",
      recentUsers: "Recent Users",
      monthlyReservations: "Monthly Reservations",
      monthlyRevenue: "Monthly Revenue",
      revenueByHotel: "Revenue by Hotel",
      revenueByAirline: "Revenue by Airline"
    },
    flightManager: {
      title: "Flight Manager Dashboard",
      subtitle: "Welcome back, {name}. Overview of active flights.",
      recentFlights: "Recent Flights",
      table: {
        flight: "Flight",
        route: "Route",
        departure: "Departure",
        seats: "Seats",
        status: "Status"
      }
    },
    hotelManager: {
      title: "Hotel Manager Dashboard",
      subtitle: "Welcome back, {name}. Here is an overview of your properties.",
      noProperties: "No Properties Yet",
      noPropertiesDesc: "You haven't been assigned to manage any hotels yet. Contact the admin.",
      totalRooms: "Rooms",
      reservations: "Reservations",
      roomsSection: "Rooms",
      roomNumber: "Room {number}",
      capacity: "Cap: {capacity}",
      available: "Available",
      booked: "Booked",
      moreRooms: "+ {count} more rooms"
    }
  }
};
