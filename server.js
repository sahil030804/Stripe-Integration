const express = require("express");
const redis = require("./lib/redis");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const cors = require("cors");
const config = require("./config/config");
const queueHelper = require("./utils/queueHelper");
const webhookHandler = require("./components/webhook/webhook.controller");
const connectPostgres = require("./lib/postgres");
const router = require("./indexRoute");
const errorHandler = require("./middleware/errorHandler");
const worker = require("./lib/worker");

const app = express();

//Bull mq dashboard
app.use("/admin/queues", queueHelper.serverAdapter.getRouter());

//Run worker for complete job
console.log(
  `Import worker is running correctly`,
  worker.paymentProcessWorker.isRunning()
);

app.use(
  session({
    secret: config.serverConfig.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 },
    store: new RedisStore({ client: redis.createClient() }),
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

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
