const mongoose = require("mongoose");
const validator = require("validator");

mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api");

// const User = mongoose.model("user", {
//     name: {
//         type: String,
//     },
//     age: {
//         type: Number,
//     },
// });

// const newUser = new User({ name: "Sekiro", age: 18 });

// newUser
//     .save()
//     .then(() => {
//         console.log(newUser);
//     })
//     .catch((error) => {
//         console.log("Error", error);
//     });

const Task = mongoose.model("task", {
    description: {
        type: String,
        trim: true,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
});

const myTask = new Task({
    description: "Complete Node course",
    completed: false,
});

myTask
    .save()
    .then(() => {
        console.log(myTask);
    })
    .catch((error) => {
        console.log("Something went wrong");
    });
