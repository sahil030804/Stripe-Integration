module.exports = {
  CURRENCY: {
    USD: "USD",
    INR: "INR",
  },
  PRICE_TYPE: {
    RECURRING: "recurring",
    ONETIME: "one_time",
  },
  STRIPE_TEST_CARDS: {
    VISA: "tok_visa",
    DEBIT_VISA: "tok_visa_debit",
    MASTERCARD: "tok_mastercard",
    DEBIT_MASTERCARD: "tok_mastercard_debit",
    AMERICAN_EXPRESS: "tok_amex",
    DISCOVER: "tok_discover",
    DINERS_CLUB: "tok_diners",
    JCB: "tok_jcb",
    UNIONPAY: "tok_unionpay",
  },
  COLLECTION_METHOD: {
    AUTOMATIC: "charge_automatically",
    SEND_INVOICE: "send_invoice",
  },
  PAYMENT_STATUS: {
    PAID: "paid",
    INPROGRESS: "in progress",
    SUCCEEDED: "succeeded",
  },
  PAYMENT_TYPE: {
    ONETIME: "onetime",
    SUBSCRIPTION: "subscription",
  },
  PLAN_TYPE: {
    ONETIME: "onetime",
    SUBSCRIPTION: "subscription",
  },
};
