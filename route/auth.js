const express = require("express");
const User = require("../models/User"); // Import the User model
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

// Secret key for JWT signing (consider storing in environment variable)
const JWT_SECRET = "chaitanya";

// Route for creating a new user
router.post(
  "/createuser",
  [
    // Validation middleware using express-validator
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isLength({ min: 3 }),
  ],
  async (req, res) => {
    let success = false;

    // Validate the request body against the specified rules
    const result = validationResult(req);

    if (!result.isEmpty()) {
      // Return a 400 response with validation errors if any
      success = false;
      return res.status(400).json({
        errors: result.array(),
      });
    }

    try {
      // Check if a user with the provided email already exists
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        // Return a 400 response with an error message if the email exists
        success = false;
        return res.status(400).json({
          error: "Sorry, this email already exists.",
        });
      }

      // Create a new user if validation passes and the email doesn't exist
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        password: hashedPassword,
        email: req.body.email,
      });

      // Return the created user data in the response
      const data = {
        user: {
          id: user.id,
        },
      };

      // Create and send JWT token for user authentication
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;

      res.json({ success, authtoken });
    } catch (error) {
      // Log and handle server errors
      console.error("Error during user creation:", error.message);
      res.status(500).send("Server Error");
    }
  }
);


// Route for getting user details
router.post(
  "/getuser",
  fetchuser,
  async (req, res) => {
    try {
      // Fetch the user ID from the middleware
      userId = req.user.id;
      // Retrieve user details excluding the password
      const user = await User.findById(userId).select("-password");
      res.json(user);
    } catch (error) {
      // Log and handle server errors
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

// Route for user login
router.post(
  "/login",
  [
    // Validation middleware using express-validator
    body("email").isEmail(),
    body("password").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    let success = false;

    if (!result.isEmpty()) {
      // Return a 400 response with validation errors if any
      return res.status(400).json({
        errors: result.array(),
      });
    }

    try {
      const { email, password } = req.body;

      // Check if the user with the provided email exists
      let user = await User.findOne({ email });
      if (!user) {
        // Return a 400 response with an error message for invalid credentials
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Compare the provided password with the hashed password in the database
      const comparePassword = await bcrypt.compare(password, user.password);
      if (!comparePassword) {
        // Return a 400 response with an error message for invalid credentials
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Create a JWT token
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;

      // Send a response with success and authtoken
      res.json({ success, authtoken });
    } catch (error) {
      // Log and handle server errors
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);


module.exports = router;
