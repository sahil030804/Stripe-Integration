const webhookService = require('./webhook.service');

class WebhookController {
  async stripeWebhooks(req, res, next) {
    try {
      await webhookService.stripeWebhooks(
        req.body,
        req.header('stripe-signature')
      );
      res.json().end();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new WebhookController();
