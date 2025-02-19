const express = require("express");
const config = require("./config/config");

const connectPostgres = require("./lib/postgres");

const app = express();
connectPostgres();

app.listen(config.serverConfig.port, () => {
  console.log(`Server is running on PORT ${config.serverConfig.port}`);
});
