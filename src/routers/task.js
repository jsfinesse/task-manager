// npm modules import
const express = require("express");
const router = new express.Router();

// Auth midddleware import
const auth = require("../middleware/auth");
const Task = require("../models/task");

// Create post route
router.post("/tasks", auth, async (req, res) => {
    // Create task object with request data and associate owner with it
    const task = new Task({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Read all tasks route
// GET /tasks?completed=${Boolean}
// GET /tasks?limit=${Number}&skip=${Number}
// GET /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
    /* Regular method to filter */
    // try {
    //     let tasks = {};
    //     if (req.query.completed !== null) {
    //         tasks = await Task.find({
    //             completed: req.query.completed === "true",
    //             owner: req.user._id,
    //         });
    //     } else {
    //         tasks = await Task.find({ owner: req.user._id });
    //     }

    //     res.send(tasks);
    // } catch (e) {
    //     res.status(500).send();
    // }

    /* Populate method to fetch tasks */
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === "true";
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: "tasks",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            },
        });
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    }
});

// Read single specified task
router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({ _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

// Update task route
router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isUpdateValid = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isUpdateValid) {
        return res.status(400).send({ error: "Invalid update" });
    }

    try {
        // const task = await Task.findById(req.params.id);
        const task = await Task.findById({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => (task[update] = req.body[update]));

        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Delete specified task route
router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id,
        });

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
