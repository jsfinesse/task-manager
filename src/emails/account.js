const sendgridMail = require("@sendgrid/mail");

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

const welcomeEmail = (email, name) => {
    sendgridMail.send({
        to: email,
        from: "prithusingh0327@gmail.com",
        subject: "Welcome, thanks for signing up",
        text: `Hi ${name} we are glad you chose our services. Feel free to look around and get comfortable with the app. Here's to productive days and happy worklife.`,
    });
};

const cancelEmail = (email, name) => {
    sendgridMail.send({
        to: email,
        from: "prithusingh0327@gmail.com",
        subject: "Sorry to see you go",
        text: `Goodbye ${name}, you can always come back and sign up for a new account. If you have any feedback do let us know.`,
    });
};

module.exports = {
    welcomeEmail,
    cancelEmail,
};
