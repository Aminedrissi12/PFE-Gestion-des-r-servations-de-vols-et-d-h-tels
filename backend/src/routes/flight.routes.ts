import { Router } from 'express';
import {
  getFlights, getFlightById, createFlight, updateFlight, deleteFlight, getMyFlights
} from '../controllers/flight.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getFlights);
router.get('/my', authenticate, authorize('FLIGHT_MANAGER', 'ADMIN'), getMyFlights);
router.get('/:id', getFlightById);
router.post('/', authenticate, authorize('FLIGHT_MANAGER', 'ADMIN'), createFlight);
router.put('/:id', authenticate, authorize('FLIGHT_MANAGER', 'ADMIN'), updateFlight);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteFlight);

export default router;
