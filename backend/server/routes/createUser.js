import express from "express";
import bcrypt from "bcrypt";
import db from "../condb.js";

const router = express.Router();

// Create a new user
router.post("/createUser", async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Check if the username already exists
        const checkUserQuery = "SELECT * FROM users WHERE username = $1";
        const checkUserResult = await db.query(checkUserQuery, [username]);
        if (checkUserResult.rows.length > 0) {
            return res.status(400).json({ message: "Username already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database with 100000 as the virtualMoney value
        const insertQuery = `
            INSERT INTO users (username, password, virtualMoney) 
            VALUES ($1, $2, 100000) RETURNING userId
        `;
        const result = await db.query(insertQuery, [username, hashedPassword]);

        res.status(201).json({ message: "User created successfully.", userId: result.rows[0].userId });
        console.log("User created successfully.");
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

export default router;
