const express = require("express");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize the supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(express.json());

// GET: Retrieve user from the supabase

app.get("/users", async (req, res) => {
  try {
    const { data, error } = await supabase.rpc("fetch_all_data");

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/userCredential", async (req, res) => {
  try {
    const { user_name } = req.body; // Get user_name from request body

    if (!user_name) {
      return res.status(400).json({ error: "user_name is required" });
    }

    const { data, error } = await supabase
      .from("user_credentials")
      .select("id, user_email, user_name, user_phone_no, created_at")
      .eq("user_name", user_name) // ✅ Match with user_name
      .single(); // Fetch only one matching record

    if (error) {
      console.error("Supabase error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data); // ✅ Return user data
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
// POST: Insert a new user into the supabase

app.post("/user", async (req, res) => {
  const { name, email } = req.body;

  const { data, error } = await supabase.from("user").insert([{ name, email }]);

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
});

app.get("/", (req, res) => {
  res.send("Hello from Express.js");
});

// Start the server
app.listen(port, () => {
  console.log(`The server is running on http://localhost:${port}`);
});
