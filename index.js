const express = require("express");
const server = express();
const PORT = 3000;

const apiRouter = require("./api");
server.use("/api", apiRouter);

server.use((req, res, next) => {
  console.log("<____Body Logger START____>");
  console.log(req.body);
  console.log("<_____Body Logger END_____>");

  next();
});

server.listen(PORT, () => {
  console.log("The server is up on port", PORT);
});
