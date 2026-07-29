const express = require('express');
const router = express.Router();
const {
  getTickets, getTicketById, createTicket, updateTicket, deleteTicket,
} = require('../controllers/ticketController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/', authorize('employee'), createTicket);
router.put('/:id', updateTicket); // fine-grained authorization handled in controller
router.delete('/:id', authorize('admin'), deleteTicket);

module.exports = router;
