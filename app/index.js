const express = require("express");
const { query } = require("./db");
// ---
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const bcrypt = require("bcrypt");
// ---
const path = require("path");
const port = process.env.PORT || 8000;

const { rootRequest, login, adminPage, studentPage, logout, loginPage, register, registerPage, deleteStudent } = require("./controllers");

// Menangkap promise error pada express, jika tidak menggunakan ini
// tiap error promise yang terjadi akan memberhentikan semua request
require("express-async-errors");

// Inisiasi express
const app = express();

// agar express bisa membaca json
app.use(express.json()); // biar bisa pakai json
app.use(express.urlencoded()); // biar bisa di akses di form

// passport local strategy
passport.use(
  new LocalStrategy(async function (username, password, done) {
    // mengecek apakah ada user dengan email tsb
    const getUser = await query(
      `select * from users where email = '${username}'`
    );
    const user = getUser.rows[0];
    // Kalau tidak kirim pesan 'Password and username invalid'
    if (!user)
      return done(null, false, { message: "Password and username invalid!" });
    //megecek apakah password yang dituliskan user sudah sesuai atai tidak
    if (!(await bcrypt.compare(password, user.password))) {
      return done(null, false, { message: "Password and username invalid!" });
    }
    return done(null, user);
  })
);

// buat inject req.session object dengan user
passport.serializeUser((user, done) => {
  done(null, user);
});

// buat inject req object dengan user
passport.deserializeUser((user, done) => {
  done(null, user);
});

// inisiasi penggunaan passport
app.use(
  session({
    secret: "yang=penting=aman",
  })
);
app.use(passport.initialize());
app.use(
  passport.session({
    secret: "yang=penting=aman",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

// menggunakan template engine, dengan tipe ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", require("ejs").__express);

// router
app.get("/", (req, res) => rootRequest(req, res));
app.get("/login", (req, res) => loginPage (req, res));
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/" }),
  (req, res) => login(req, res)
);
app.get("/register", (req,res) => registerPage(req, res));
app.post("/register", (req,res) => register(req, res));

app.get("/admin", (req, res) => adminPage(req, res));
app.get("/admin/delete/:id", (req, res) => deleteStudent(req, res))
app.get("/student", (req, res) => studentPage(req, res));
app.post("/logout", (req, res) => logout(req,res));

app.listen(port, () => {
  console.info(`Aplikasi berjalan di port, http://localhost:${port}`);
});
