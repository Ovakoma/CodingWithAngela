//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
})

app.post("/register", (req, res) => {
    const newUser = new User ({
        email: req.body.username,
        password: md5(req.body.password)
    });

    try {
            newUser.save();
            res.render("secrets");
    } catch(err) {
        console.log(err);
    }
    
})

app.post("/login", (req, res) => {
    const userEmail = req.body.username;
    const userPassword = md5(req.body.password);

    User.findOne({email: userEmail}).then((foundUser) => {
        if (foundUser) {
            if (foundUser.password === userPassword) {
                res.render("secrets");
            }
        }
    }).catch((err) => {
        console.log(err);
        res.send(400, "Bad Request");
    })
})

app.listen(3000, function() {
    console.log("Server running on port 3000");
})