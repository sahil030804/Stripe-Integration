module.exports = {
  //Auth
  TOKEN_REQUIRED: {
    httpStatusCode: 404,
    body: {
      code: "required",
      message: "Token required",
    },
  },
  ACCESS_DENIED: {
    httpStatusCode: 403,
    body: {
      code: "forbidden",
      message: "Access denied",
    },
  },
  ACCESS_TOKEN_REQUIRED: {
    httpStatusCode: 403,
    body: {
      code: "token_required",
      message: "Token is required",
    },
  },
  INVALID_ACCESS_TOKEN: {
    httpStatusCode: 401,
    body: {
      code: "invalid",
      message: "Token is not valid or expired",
    },
  },
  INVALID_REFRESH_TOKEN: {
    httpStatusCode: 401,
    body: {
      code: "invalid",
      message: "Refresh token is not valid or expired",
    },
  },
  USER_EXIST: {
    httpStatusCode: 409,
    body: {
      code: "duplicate",
      message: "User already exist",
    },
  },
  EMAIL_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Email not found",
    },
  },
  USER_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "User not found",
    },
  },
  INVALID_PASSWORD: {
    httpStatusCode: 400,
    body: {
      code: "invalid",
      message: "Invalid password",
    },
  },

  //plans

  PLAN_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Plan not found",
    },
  },
  PLAN_ALREADY_EXIST: {
    httpStatusCode: 409,
    body: {
      code: "duplicate",
      message: "Plan already exist",
    },
  },
  PRICE_DELETED: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Plan's price deleted",
    },
  },

  //payment methods

  PAYMENT_METHOD_NOT_FOUND: {
    httpStatusCode: 404,
    body: {
      code: "not_found",
      message: "Payment method not found",
    },
  },
  PAYMENT_METHOD_NOT_ATTACHED: {
    httpStatusCode: 400,
    body: {
      code: "not_attached",
      message: "The specified payment method is not attached to this customer.",
    },
  },

  CANNOT_DELETE_METHOD: {
    httpStatusCode: 409,
    body: {
      code: "payment_method_in_use",
      message:
        "Can't delete payment method cause it attached to active subscription",
    },
  },
  // price related
  INVALID_PRICE: {
    httpStatusCode: 400,
    body: {
      code: "invalid",
      message:
        "Ensure that subscription create for recurring price and payment intent for onetime price only not vice versa.",
    },
  },
};
