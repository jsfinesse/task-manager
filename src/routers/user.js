const multer = require("multer");
const express = require("express");
const router = new express.Router();

const auth = require("../middleware/auth");
const User = require("../models/user");

// Create user route
router.post("/users", async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

// Login user route
router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

// Logout user route
router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Logout user from all sessions route
router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

// Get user route
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

// Update user route
router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isUpdateValid = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isUpdateValid) {
        return res.status(400).send({ error: "Invalid update" });
    }

    try {
        updates.forEach((update) => (req.user[update] = req.body[update]));

        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(400).send({ error: "Caught an error" });
    }
});

// Delete user route
router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

// Image upload middleware
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error("Please upload an image"));
        }
        cb(undefined, true);
    },
});

// Avatar upload/update route
router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        req.user.avatar = req.file.buffer;
        await req.user.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).send({
            error: error.message,
        });
    }
);

// Avatar delete route
router.delete("/users/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

// Get user avatar by id route
router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set("Content-Type", "image/jpg");
        res.send(user.avatar);
    } catch (e) {
        res.status(400).send();
    }
});

module.exports = router;
