# Social Media App

## Description

This is a backend for a social media platform built using the express framework. It features user authentication, post creation, commenting, liking, friend requests, and a feed system. The app uses JWT for authentication.

Swagger docs: [https://social-media-project-5ciw.onrender.com/docs](https://social-media-project-5ciw.onrender.com/docs)

## Features

- **User Authentication**: JWT-based authentication for login, registration, password management, and protected routes.
- **Post Management**: Users can create, update, and delete posts, as well as comment on and like posts.
- **Friend Requests**: Send, accept, and reject friend requests. Track friend relationships.
- **Feed**: Users can view posts, friend comments, and liked posts in their feed.
- **Friend Management**: View and manage friends.

## Routes

### Authentication (`/api/auth`)

- `POST /register`: Register a new user with validation.
- `POST /login`: Log in a user and return a JWT.
- `POST /change-password`: Change the password for a logged-in user.
- `GET /refresh`: Refresh the JWT token.
- `GET /logout`: Log out the user and invalidate the token.
- `GET /me`: Retrieve the logged-in user's details.

### Posts (`/api/posts`)

- `POST /`: Create a new post (with validation).
- `GET /`: Retrieve all posts created by the logged-in user.
- `GET /:id`: Retrieve a single post by ID.
- `PATCH /:id`: Update a post by ID (with validation).
- `DELETE /:id`: Delete a post by ID.
- `POST /:id/comment`: Add a comment to a post.
- `GET /:id/comment`: Get comments on a post.
- `PATCH /:id/comment/:commentId`: Update a comment on a post.
- `DELETE /:id/comment/:commentId`: Delete a comment on a post.
- `POST /:id/toggle-like`: Like or unlike a post.
- `POST /:id/comment/:commentId/toggle-like`: Like or unlike a comment.

### Friend Requests (`/api/requests`)

- `GET /`: Retrieve the list of friend requests.
- `POST /`: Send a new friend request.
- `POST /:id/accept`: Accept a friend request.
- `POST /:id/reject`: Reject a friend request.

### Feed (`/api/feed`)

- `GET /`: Get the feed with posts by friends.
- `GET /friend-comment`: Get posts commented on by friends.
- `GET /friend-liked`: Get posts liked by friends.

### Users (`/api/users`)

- `GET /`: Retrieve all user details.
- `GET /:id`: Retrieve user details.
- `GET /:id/friends`: Retrieve the user's friends.
- `PATCH /:id`: Update user details (with validation).
- `DELETE /:id`: Delete a user account.
- `DELETE /:id/unfriend`: Unfriend a user.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Token)
- **Validation**: express-validator
- **Mongoose**: For MongoDB interaction

## Installation

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Configure environment variables as described in `.env.example` file.
4. Run the development server: `npm run dev`.

## Authentication

JWT authentication is used throughout the application. Tokens are required for accessing protected routes such as creating posts, commenting, liking, and managing friends.

## License

This project is licensed under the MIT License.
