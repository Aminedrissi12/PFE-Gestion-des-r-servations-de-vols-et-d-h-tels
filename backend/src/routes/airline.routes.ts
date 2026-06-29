import { Router } from 'express';
import {
  getAirlines, getAirlineById, createAirline, updateAirline,
  deleteAirline, assignManagerToAirline, getMyAirlines
} from '../controllers/airline.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getAirlines);
router.get('/my', authenticate, authorize('FLIGHT_MANAGER', 'ADMIN'), getMyAirlines);
router.get('/:id', getAirlineById);
router.post('/', authenticate, authorize('ADMIN'), createAirline);
router.put('/:id', authenticate, authorize('ADMIN'), updateAirline);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteAirline);
router.post('/:id/assign-manager', authenticate, authorize('ADMIN'), assignManagerToAirline);

export default router;
