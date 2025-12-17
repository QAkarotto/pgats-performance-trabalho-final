const express = require('express');
const { createUser, getCurrentUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Register a new user in the system
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User password (minimum 6 characters)
 *                 example: "password123"
 *               name:
 *                 type: string
 *                 description: User full name (optional)
 *                 example: "John Doe"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: User ID
 *                 email:
 *                   type: string
 *                   description: User email
 *                 name:
 *                   type: string
 *                   description: User name
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: User creation date
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     summary: Get current authenticated user
 *     description: Retrieve the data of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: User ID
 *                 email:
 *                   type: string
 *                   description: User email
 *                 name:
 *                   type: string
 *                   description: User name
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: User creation date
 *       401:
 *         description: Unauthorized - missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', createUser);
router.get('/', authMiddleware, getCurrentUser);

module.exports = router;
