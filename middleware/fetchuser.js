var jwt = require("jsonwebtoken")
const JWT_SECRET = "chaitanya";

// Middleware function for fetching user details from the JWT token
const fetchuser = (req, res, next) => {
    try {
        // Retrieve the token from the request headers
        const token = req.header('auth-token');

        // If no token is provided, return a 401 Unauthorized response
        if (!token) {
            res.status(401).send({ error: "Please authenticate using a valid token" });
        }

        // Verify the token and extract user data
        const data = jwt.verify(token, JWT_SECRET);

        // Attach user data to the request for further use in the route handler
        req.user = data.user;

        // Move to the next middleware or route handler
        next();
    } catch (error) {
        // Log and handle server errors
        console.error(error.message);
        res.status(401).send("Server Error");
    }
}

// Export the fetchuser middleware for use in other files
module.exports = fetchuser;
