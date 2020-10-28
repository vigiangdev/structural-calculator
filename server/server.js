const express = require("express");
const app = express();

app.disable("x-powered_by");

// handle production
if (process.env.NODE_ENV === "production") {
  // static folder
  app.use(express.static(`${__dirname}/public/`));

  // handle SPA
  app.get(/.*/, (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
  });
}

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server has started on port ${port}`);
});

process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Rejection at:", err.stack || err);
  server.close(() => {
    console.log("Server closing");
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.info("SIGTERM signal received.");
  console.log("Closing http server.");
  server.close(() => {
    console.log("Http server closed.");
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed.");
    });
  });
});
