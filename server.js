const express = require("express");
const config = require("./config/config");
const webhookHandler = require("./components/webhook/webhook.controller");

const connectPostgres = require("./lib/postgres");
const router = require("./indexRoute");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.post(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhookHandler.stripeWebhooks
);
app.use(express.json());
connectPostgres();
app.use("/api", router);
app.use(errorHandler);

app.listen(config.serverConfig.port, () => {
  console.log(`Server is running on PORT ${config.serverConfig.port}`);
});
