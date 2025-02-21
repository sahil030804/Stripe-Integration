const express = require("express");
const config = require("./config/config");

const connectPostgres = require("./lib/postgres");
const router = require("./indexRoute");
const errorHandler = require("./middleware/errorHandler");
// const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(express.json());
connectPostgres();

app.use("/api", router);
app.use(errorHandler);

app.listen(config.serverConfig.port, () => {
  console.log(`Server is running on PORT ${config.serverConfig.port}`);
});
