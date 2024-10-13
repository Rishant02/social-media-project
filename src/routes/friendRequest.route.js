const express = require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const friendController = require("../controllers/friend.controller");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: API for managing friend requests.
 */

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get friend requests
 *     tags: [Requests]
 *     security:
 *       - bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     responses:
 *       200:
 *         description: Successfully retrieved friend requests.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       sender:
 *                         type: string
 *                       receiver:
 *                         type: string
 *       401:
 *         description: Unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 */
router.get("/", isAuthenticated, friendController.getFriendRequests);

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Send friend request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully sent friend request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 request:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     sender:
 *                       type: string
 *                     receiver:
 *                       type: string
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 */
router.post("/", isAuthenticated, friendController.sendFriendRequest);

/**
 * @swagger
 * /requests/{id}/accept:
 *   post:
 *     summary: Accept friend request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the friend request to accept.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully accepted friend request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 request:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     sender:
 *                       type: string
 *                     receiver:
 *                       type: string
 *       404:
 *         description: Friend request not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 */
router.post(
  "/:id/accept",
  isAuthenticated,
  friendController.acceptFriendRequest
);

/**
 * @swagger
 * /requests/{id}/reject:
 *   post:
 *     summary: Reject friend request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth:
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the friend request to reject.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully rejected friend request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 request:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     sender:
 *                       type: string
 *                     receiver:
 *                       type: string
 *       404:
 *         description: Friend request not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 */
router.post(
  "/:id/reject",
  isAuthenticated,
  friendController.rejectFriendRequest
);

module.exports = router;
