const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const userController = require("../controllers/user.controller");
const { updateUserValidation } = require("../middlewares/userValidation");
const validateRequest = require("../middlewares/validateRequest");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API for managing users.
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get Users
 *     description: Retrieve a list of users.
 *     tags: [User]
 *     security:
 *       - bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     parameters:
 *       - name: search
 *         in: query
 *         description: Search term to filter users.
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *       500:
 *         description: Internal server error.
 */
router.get("/", isAuthenticated, userController.getUsers);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get User by ID
 *     description: Retrieve a user by their unique ID.
 *     tags: [User]
 *     security:
 *       - bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User's unique ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/:id", isAuthenticated, userController.getUser);
/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update User
 *     description: Update a user's information.
 *     tags: [User]
 *     security:
 *       - bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User's unique ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.patch(
  "/:id",
  isAuthenticated,
  updateUserValidation,
  validateRequest,
  userController.updateUser
);
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete User
 *     description: Delete a user by their unique ID.
 *     tags: [User]
 *     security:
 *       - bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User's unique ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/:id", isAuthenticated, userController.deleteUser);
/**
 * @swagger
 * /users/{id}/friends:
 *   get:
 *     summary: Get User Friends
 *     description: Retrieve a list of a user's friends.
 *     tags: [User]
 *     security:
 *       - bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User's unique ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of user friends.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/:id/friends", isAuthenticated, userController.getFriends);
/**
 * @swagger
 * /users/{id}/unfriend:
 *   delete:
 *     summary: Unfriend User
 *     description: Remove a user from the friend list.
 *     tags: [User]
 *     security:
 *       - bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User's unique ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User unfriended successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.delete("/:id/unfriend", isAuthenticated, userController.unfriend);

module.exports = router;
