const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('../config');
const { ensureLoggedIn, ensureAdmin } = require('../middleware/auth');

router.get('/', (req, res, next) => {
    res.send('APP IS WORKING!!!');
});

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async function (req, res, next) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            throw new ExpressError('Username and password required', 400);
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    } catch (err) {
        return next(err);
    }
});
