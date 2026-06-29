import { Router } from 'express';
import {
  getMyReservations, createFlightReservation, cancelFlightReservation,
  createHotelReservation, cancelHotelReservation, getAllReservations,
  updateHotelReservationStatus, updateHotelReservationPaymentStatus,
  updateFlightReservationPaymentStatus
} from '../controllers/reservation.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Client routes
router.get('/my', authenticate, getMyReservations);
router.post('/flight', authenticate, authorize('CLIENT'), createFlightReservation);
router.delete('/flight/:id', authenticate, cancelFlightReservation);
router.post('/hotel', authenticate, authorize('CLIENT'), createHotelReservation);
router.delete('/hotel/:id', authenticate, cancelHotelReservation);

// Admin / Manager routes
router.get('/all', authenticate, authorize('ADMIN', 'HOTEL_MANAGER', 'FLIGHT_MANAGER'), getAllReservations);
router.patch('/hotel/:id/status', authenticate, authorize('HOTEL_MANAGER', 'ADMIN'), updateHotelReservationStatus);
router.patch('/hotel/:id/payment', authenticate, authorize('HOTEL_MANAGER', 'ADMIN'), updateHotelReservationPaymentStatus);
router.patch('/flight/:id/payment', authenticate, authorize('FLIGHT_MANAGER', 'ADMIN'), updateFlightReservationPaymentStatus);

export default router;
