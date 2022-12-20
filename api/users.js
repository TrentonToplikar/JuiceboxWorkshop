const express = require("express");
const usersRouter = express.Router();
const jwt = require("jsonwebtoken");
const { getAllUsers, getUserByUsername } = require("../db");
const { JWT_SECRET } = process.env;

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  // res.send({ message: "hello from /users ahhhhh!!!" });
  next();
});
usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users,
  });
});

// ************ LOGIN ************ \\
usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  // request must have both username and password!!!
  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);
    if (user && user.password == password) {
      // create token & return to user
      const token = jwt.sign(user, JWT_SECRET);
      res.send({ message: "you're logged in!", token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// const jwtSignUser = (user) => {
//   try {
//     const ONE_WEEK = 60 * 60 * 24 * 7;
//     return jwt.sign(user, process.env.JWT_SECRET, {
//       expiresIn: ONE_WEEK,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };
// ********** End Login ************ \\

module.exports = usersRouter;
