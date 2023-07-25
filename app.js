const express = require("express");
const { parseDSXFile } = require("./utils");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.text({ limit: "50mb" }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/index.html"), (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.post("/convert", (req, res) => {
  const dsxContent = req.body;
  const jsonResult = parseDSXFile(dsxContent);
  console.log(jsonResult, "jsonres");
  return res.status(200).json(jsonResult);
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Listening on port ${process.env.PORT || 4000}`);
});
