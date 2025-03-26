const express = require("express");
const passportLocalStrategy = require("../config/passport-local-strategy.js");
// const passportGoogleStrategy = require("../config/passport-google-oauth.js");
const bcrypt = require("bcrypt");
const db = require("../config/db.js");

const router = express.Router();

const RESPONSE_MESSAGES = {
    NOT_AUTHENTICATED: "Not authenticated",
    USER_EXISTS: "User already exists",
    USER_CREATION_FAILED: "User creation failed",
    AUTO_LOGIN_FAILED: "User created but auto-login failed",
    USER_CREATED: "User created and logged in",
    REGISTRATION_FAILED: "Registration failed",
    INTERNAL_SERVER_ERROR: "Internal server error",
    AUTHENTICATION_FAILED: "Authentication failed",
    LOGIN_FAILED: "Login failed",
    LOGOUT_FAILED: "Logout failed",
    LOGOUT_SUCCESS: "Logged out"
};

router.get("/", (req, res) => {
    res.status(200).json({ ok: true, data: "Users data received" });
});

router.get("/me", (req, res) => {
    req.isAuthenticated()
        ? res.json(req.user)
        : res.status(401).json({ message: RESPONSE_MESSAGES.NOT_AUTHENTICATED });
});

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    const user = await db.oneOrNone("SELECT * FROM users WHERE user_emailid=$1", [email]);
    if (user) {
        return res.json({ ok: false, message: RESPONSE_MESSAGES.USER_EXISTS });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const query = "INSERT INTO users(user_name, user_emailid, password) VALUES($1, $2, $3) RETURNING user_name, user_emailid, user_id;";
        const result = await db.query(query, [name, email, hashedPassword]);

        const newUser = result.length > 0 ? result[0] : null;
        if (!newUser) {
            return res.status(500).json({ ok: false, message: RESPONSE_MESSAGES.USER_CREATION_FAILED });
        }

        req.login(newUser, (err) => {
            if (err) {
                console.error("Auto-login error:", err);
                return res.status(201).json({ message: RESPONSE_MESSAGES.AUTO_LOGIN_FAILED, user: newUser, ok: true });
            }
            return res.status(201).json({ message: RESPONSE_MESSAGES.USER_CREATED, user: newUser, ok: true });
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ ok: false, message: RESPONSE_MESSAGES.REGISTRATION_FAILED, error: error.message });
    }
});

router.post("/login", (req, res, next) => {
    passportLocalStrategy.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR, ok: false });
        }
        if (!user) {
            return res.status(401).json({ message: info.message || RESPONSE_MESSAGES.AUTHENTICATION_FAILED, ok: false });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: RESPONSE_MESSAGES.LOGIN_FAILED, ok: false });
            }
            return res.status(200).json({ user, ok: true });
        });
    })(req, res, next);
});

router.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: RESPONSE_MESSAGES.LOGOUT_FAILED });
        res.json({ message: RESPONSE_MESSAGES.LOGOUT_SUCCESS });
    });
});

// // Route to initiate Google OAuth flow
// router.get("/google", passportGoogleStrategy.authenticate("google", { scope: ["profile", "email"] }));

// // Google OAuth callback route
// router.get("/google/callback", passportGoogleStrategy.authenticate("google", { failureRedirect: "http://localhost:3000/login" }), (req, res) => {
//     res.redirect("http://localhost:3000/auth/google/callback");
// });

module.exports = router;
