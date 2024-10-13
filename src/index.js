require("dotenv").config({ path: `${__dirname}/../.env` });
const locals = require("./config/locals");
const express = require("express");
const { swaggerDocs, swaggerUi } = require("./docs/swagger");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const ErrorHandler = require("./middlewares/errorHandler");

String.prototype.toObjectId = function () {
  let ObjectId = require("mongoose").Types.ObjectId;
  return new ObjectId(this.toString());
};
// Express app
const app = express();
connectDB();

// App level middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  mongoSanitize({
    allowDots: true,
  })
);

app.get("/", (req, res) => {
  res.redirect("/docs");
});

app.get("/api/ping", (req, res) => {
  res.send("pong");
});

// Routes
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/users", require("./routes/user.route"));
app.use("/api/requests", require("./routes/friendRequest.route"));
app.use("/api/posts", require("./routes/post.route"));
app.use("/api/feed", require("./routes/feed.route"));

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handling middleware
app.use(ErrorHandler);

// Start server
app.listen(locals.PORT, () => {
  console.log(`Server running on port ${locals.PORT}`);
});
