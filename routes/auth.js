const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");

const User = require("../models/user");

// --------Register----------

router.get("/signup", (req, res) => {
    res.render("user/signup");
});

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.send("All fields are required");
        }

        if (password !== confirmPassword) {
            return res.send("Password do not match");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.send("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();
        res.redirect("/login");

    } catch (error) {
        console.log(error);
        res.send("Registration failed!");
    }

});


//----------Login----------
router.get("/login", (req, res) => {
    res.render("user/login");
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.send("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.send("Invalid email or Password");
        }

        req.session.userId = user._id;
        res.redirect("/dashboard");
    }
    catch (err) {
        console.log(err);
        res.send("Login failed");
    }
});


//--------------Logout------------

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.send("Logout failed");
        }

        res.redirect("/dashboard");
    });
});


//----------- Forgot Password -------------

router.get("/forgot-password", (req, res) => {
    res.render("user/forgot-password");
});


router.post("/forgot-password", async (req, res) => {

    try {

        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.send("All fields are required");
        }

        if (password !== confirmPassword) {
            return res.send("Passwords do not match");
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.send("No account found with this email");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        await user.save();

        res.redirect("/login");

    } catch (error) {

        console.log("Password update error:", error);

        res.send("Something went wrong");

    }

});


//--------User Preferences---------
router.get("/preferences", async (req, res) => {
    if (!req.session.userId) {
        req.flash(
            "error",
            "Please login first to personalize your weather dashboard."
        );

        return res.redirect("/login");
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect("/login");
        }
        res.render("user/preferences", { user });
    } catch (error) {
        console.log("Preference page error:", error);
        res.send("Something went wrong");
    }
});

router.post("/preferences", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect("/login");
        }
        const { userType } = req.body;
        if (!userType) {
            return res.send("Please select a preference");
        }
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect("/login");
        }
        user.userType = userType;
        await user.save();
        res.redirect("/dashboard");
    } catch (error) {
        console.log("Preference save error:", error);
        res.send("Something went wrong");
    }
});

module.exports = router;
