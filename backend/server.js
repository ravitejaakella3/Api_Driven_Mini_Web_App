const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const axios=require('axios');
require('dotenv').config();

const app=express();
app.use(express.json());
app.use(cors());

//create schema for db
const RepoSchema=new mongoose.Schema({
    name: String,
    owner: String,
    language:String,
    url: String,
    created_at:Date
})

const Repo = mongoose.model('Repo', RepoSchema);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(" Connected to DB"))
  .catch(err => console.error("DB connection failed:", err.message));

app.get("/users/:username/repos", async (req, res) => {
  try {
    const { username } = req.params;

    const response = await axios.get(`https://api.github.com/users/${username}/repos`);
    const repos = response.data;

    // if user exists but has no repos
    if (!Array.isArray(repos) || repos.length === 0) {
      return res.status(404).json({ message: "User not found or has no repos" });
    }

    // Save repos in DB
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
      if (status === 404) {
        return res.status(404).json({ message: "GitHub user not found" });
      }
      return res.status(status).json({ message: error.response.data?.message || "GitHub API error" });
    }
    res.status(500).json({ error: "Failed to fetch repos" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});