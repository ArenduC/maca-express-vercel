const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const API_CONFIG = require("./connection.js");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

// Initialize the supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(express.json());

app.post(`${API_CONFIG.ENDPOINTS.LOGIN}`, async (req, res) => {
  let { accessToken, email, password } = req.body;

  try {
    // Call Supabase function using RPC
    const { data, error } = await supabase.rpc("user_login_procedure", {
      p_email: email,
      p_password: password,
      p_accesstoken: accessToken,
    });

    if (error) {
      console.error("Supabase function error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (data?.error) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json(data);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello Darling");
});

// Start the server
app.listen(port, () => {
  console.log(`The server is running on http://localhost:${port}`);
});

module.exports = app;
