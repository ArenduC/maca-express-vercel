require("dotenv").config();
const API_CONFIG = {
  ENDPOINTS: {
    LOGIN: "/v1/user_login_credential",
    BORDER_DETAILS: "/v1/border_details",
  },
};

module.exports = API_CONFIG;
