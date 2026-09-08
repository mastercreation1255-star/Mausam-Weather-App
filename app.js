require("dotenv").config();
// const dns = require("dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { MongoStore } = require("connect-mongo");
const ejsMate = require("ejs-mate");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

const weatherRoutes = require("./routes/weather");
const app = express();

const PORT = process.env.PORT || 8080;


// ----------- Middleware -----------

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);


// ----------- MongoDB Connection -----------

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to Database");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });


// ----------- Session -----------

app.use(
    session({
        secret: process.env.SESSION_SECRET,

        resave: false,

        saveUninitialized: false,

        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            collectionName: "sessions"
        }),

        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true
        }
    })
);

app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});
/* LOGIN STATUS */

app.use((req, res, next) => {
    res.locals.isLoggedIn = !!req.session.userId;
    next();
});
// ----------- Auth Routes -----------

app.use("/", authRoutes);
app.use("/",weatherRoutes);


// ----------- Dashboard -----------

app.get("/dashboard", async (req, res) => {

    try {

        let user = null;

        if (req.session.userId) {
            const User = require("./models/user");
            user = await User.findById(req.session.userId);
        }

        res.render("dashboard", {
            user,
            title: "MAUSAM Dashboard"
        });

    } catch (error) {

        console.log(error);

        res.send("Dashboard error");

    }

});


// ----------- Home -----------

app.get("/", (req, res) => {

    res.redirect("/login");

});


// ----------- Server -----------

app.listen(PORT,  "0.0.0.0",() => {
    console.log(`Server is running on http://localhost:${PORT}`);
});