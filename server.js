const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Fake user for demo
const USER = {
  id: 1,
  username: "user",
  password: "pass",
};

// Auth middleware
function auth(req, res, next) {
  const token = req.cookies.auth_token;
  if (!token) return res.redirect("/");
  next();
}

// Login page
app.get("/", (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/">
      <input name="username" placeholder="Username" required />
      <br /><br />
      <input type="password" name="password" placeholder="Password" required />
      <br /><br />
      <button type="submit">Login</button>
    </form>
  `);
});

// Handle login
app.post("/", (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    res.cookie("auth_token", USER.id, {
      httpOnly: true,
      secure: true, // required for custom domain
      sameSite: "lax",
      domain: "*.vercel.app", // custom domain
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.redirect("/dashboard");
  }

  res.send("Invalid credentials <a href='/'>Try again</a>");
});

// Dashboard
app.get("/dashboard", auth, (req, res) => {
  res.send(`
    <h2>Dashboard</h2>
    <p>Welcome to FMIS Dashboard</p>
    <a href="/logout">Logout</a>
  `);
});

// Logout
app.get("/logout", (req, res) => {
  res.clearCookie("auth_token", {
    domain: "*.vercel.app",
  });
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
