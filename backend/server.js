const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// incoming request limiter for users routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/users', apiLimiter);

//create schema for db
const RepoSchema = new mongoose.Schema({
  name: String,
  owner: String,
  language: String,
  url: String,
  created_at: Date
});

const Repo = mongoose.model('Repo', RepoSchema);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" Connected to DB"))
  .catch(err => console.error("DB connection failed:", err.message));

app.get("/users/:username/repos", async (req, res) => {
  const { username } = req.params;
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos`,
      { headers }
    );
    const repos = response.data;

    if (!Array.isArray(repos) || repos.length === 0) {
      const cached = await Repo.find({ owner: username }).sort({ created_at: -1 });
      if (cached.length) return res.status(200).json(cached);
      return res.status(404).json({ message: "User found but has no repos" });
    }

    // Save repos in DB (upsert)
    const savedRepos = await Promise.all(repos.map(async repo => {
      return Repo.findOneAndUpdate(
        { name: repo.name, owner: repo.owner.login },
        {
          name: repo.name,
          owner: repo.owner.login,
          language: repo.language,
          url: repo.html_url,
          created_at: repo.created_at
        },
        { upsert: true, new: true }
      );
    }));

    res.status(200).json(savedRepos);
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const rlRemaining = error.response.headers?.['x-ratelimit-remaining'];
      const rlReset = error.response.headers?.['x-ratelimit-reset'];

      // on rate limit attempt DB fallback
      if (status === 403) {
        try {
          const cached = await Repo.find({ owner: username }).sort({ created_at: -1 });
          if (cached.length) return res.status(200).json(cached);
        } catch (dbErr) {
          console.error("DB fallback failed:", dbErr.message);
        }
        return res.status(403).json({
          message: "GitHub rate limited or forbidden",
          rateRemaining: rlRemaining,
          rateReset: rlReset
        });
      }

      if (status === 404) {
        try {
          const cached = await Repo.find({ owner: username }).sort({ created_at: -1 });
          if (cached.length) return res.status(200).json(cached);
        } catch (dbErr) {
          console.error("DB fallback failed:", dbErr.message);
        }
        return res.status(404).json({ message: "GitHub user not found" });
      }

      return res.status(status).json({ message: error.response.data?.message || "GitHub API error" });
    }

    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch repos" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});