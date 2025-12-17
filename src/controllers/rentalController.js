const rentalService = require('../services/rentalService');

async function createRental(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { carId, startDate, endDate } = req.body || {};
    const rental = await rentalService.rentCar({ userId, carId, startDate, endDate });
    res.status(201).json(rental);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getRentals(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const rentals = await rentalService.getRentalsByUserId(userId);
    res.json(rentals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteRental(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const rentalId = parseInt(req.params.id);
    if (!rentalId) return res.status(400).json({ error: 'Invalid rental ID' });
    
    // Verificar se o rental pertence ao usuário
    const rental = await rentalService.getRentalById(rentalId);
    if (!rental) return res.status(404).json({ error: 'Rental not found' });
    if (rental.userId !== userId) return res.status(403).json({ error: 'Access denied' });
    
    const cancelledRental = await rentalService.cancelRental(rentalId);
    res.json(cancelledRental);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { createRental, getRentals, deleteRental };

