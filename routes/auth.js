const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
//const db = require('../db');
//const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('../config');
//const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');
const User = require('../models/user');

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        // Run authentication and wait for true
        if (await User.authenticate(username, password)) {
            // Get the token
            let token = jwt.sign({ username }, SECRET_KEY);
            // Update the login timestamp
            User.updateLoginTimestamp(username);
            // Return the token
            return res.json({ token });
        } else {
            throw new ExpressError('Invalid username/password', 400);
        }
    } catch (err) {
        return next(err);
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async function (req, res, next) {
    try {
        // Register user
        let newUser = await User.register(req.body);
        let username = newUser.username;
        // Get the token
        let token = jwt.sign({ username: newUser.username }, SECRET_KEY);
        // Update the login timestamp
        User.updateLoginTimestamp(username);
        // Return the token
        return res.json({ token });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
