const express = require('express');
const auth = require('../middleware/auth');
const { createRental, getRentals, deleteRental } = require('../controllers/rentalController');

const router = express.Router();

/**
 * @swagger
 * /api/rentals:
 *   get:
 *     summary: Get user's rentals
 *     description: Get all rentals for the authenticated user
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's rentals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rental'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a car rental
 *     description: Create a new car rental for the authenticated user
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - carId
 *             properties:
 *               carId:
 *                 type: string
 *                 description: ID of the car to rent
 *                 example: "101"
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Rental start date (optional, defaults to now)
 *                 example: "2023-12-25T10:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Rental end date (optional)
 *                 example: "2023-12-30T10:00:00Z"
 *     responses:
 *       201:
 *         description: Rental created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', auth, getRentals);
router.post('/', auth, createRental);

/**
 * @swagger
 * /api/rentals/{id}:
 *   delete:
 *     summary: Cancel a rental
 *     description: Cancel/delete a rental for the authenticated user
 *     tags: [Rentals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Rental ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Rental cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rental'
 *       400:
 *         description: Invalid rental ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied (rental doesn't belong to user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Rental not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', auth, deleteRental);

module.exports = router;

