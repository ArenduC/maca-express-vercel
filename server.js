const express = require("express");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8000;

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

app.get("/macaUser", async (req, res) => {
  try {
    const { data, error } = await supabase.from("maca_user").select("*"); // Fetch only one matching record

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

app.post(`/user_login`, async (req, res) => {
  let { email, password, accessToken } = req.body;

  try {
    // Fetch user details
    const { data: userResult, error: userError } = await supabase
      .from("user")
      .select(
        `id, name, 
         user_type_master(user_type), 
         user_bed_master(user_bed), 
         addres_master(city)
       `
      )
      .eq("email", email)
      .eq("password", password);

    if (userError) throw userError;

    if (!userResult || userResult.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Extract user ID
    const borderId = userResult[0].id;
    console.log(borderId);

    // Check if accessToken exists
    const { data: accessTokenResult, error: accessTokenError } = await supabase
      .from("user_accesstoken")
      .select("borderId")
      .eq("borderId", borderId)
      .single();

    if (accessTokenError && accessTokenError.code !== "PGRST116") {
      throw accessTokenError;
    }

    if (accessTokenResult) {
      // Update token
      const { error: updateError } = await supabase
        .from("user_accesstoken")
        .update({ accessToken })
        .eq("borderId", borderId);

      if (updateError) throw updateError;
    } else {
      // Insert new token
      const { error: insertError } = await supabase
        .from("user_accesstoken")
        .insert([{ borderId, accessToken }]);

      if (insertError) throw insertError;
    }

    res.json({ message: "Login successful", user: userResult[0] });
  } catch (err) {
    console.error("Supabase query error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post(`/user_login_credential`, async (req, res) => {
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
