const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const db = require('../db');
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const Message = require('../models/message');

router.get('/', (req, res, next) => {
    res.send('TEMP APP IS WORKING!!!');
});

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureLoggedIn, async function (req, res, next) {
    const id = req.params.id;
    try {
        const message = await Message.get(id);
        const toUser = message.to_user.username;
        const fromUser = message.from_user.username;
        if (req.user.username === toUser || req.user.username === fromUser) {
            return res.json({ message });
        } else {
            throw new ExpressError(
                'You are forbidden from viewing this message',
                403
            );
        }
    } catch (err) {
        next(err);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async function (req, res, next) {
    console.log(req.user);
    try {
        const { to_username, body } = req.body;
        const from_username = req.user.username;
        const message = await Message.create({
            from_username,
            to_username,
            body,
        });
        return res.json({ message });
    } catch (err) {
        next(err);
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async function (req, res, next) {
    const id = req.params.id;
    try {
        const msg = await Message.get(id);
        const recipient = msg.to_user.username;

        if (req.user.username === recipient) {
            let message = await Message.markRead(id);
            return res.json({ message });
        } else {
            throw new ExpressError("You can't mark this message as read", 401);
        }
    } catch (err) {
        next(err);
    }
});

module.exports = router;
