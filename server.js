const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Alains Server is working!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Alains server running on port ${PORT}`);
});
