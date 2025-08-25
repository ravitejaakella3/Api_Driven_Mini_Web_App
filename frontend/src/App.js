import React, { useState } from "react";
import axios from "axios";

function App() {
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const reposPerPage = 5; 

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/data`);
      setRepos(response.data);
      setCurrentPage(1);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError("User not found");
      } else {
        setError("Failed to fetch repos. Try again.");
      }
    }finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUsername("");
    setRepos([]);
    setCurrentPage(1);
  };

  const indexOfLastRepo = currentPage * reposPerPage;
  const indexOfFirstRepo = indexOfLastRepo - reposPerPage;
  const currentRepos = repos.slice(indexOfFirstRepo, indexOfLastRepo);
  const totalPages = Math.ceil(repos.length / reposPerPage);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h2 style={{ color: "#333" }}> GitHub Repo Finder</h2>

      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter GitHub username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "8px",
            width: "250px",
            marginRight: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#007bff",
            color: "#fff",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Search
        </button>
        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: "8px 12px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#6c757d",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {repos.length > 0 && (
        <>
          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Repo Name</th>
                <th>Owner</th>
                <th>Language</th>
                <th>URL</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {currentRepos.map((repo, index) => (
                <tr key={repo._id || repo.url}>
                  <td>{indexOfFirstRepo + index + 1}</td>
                  <td>{repo.name}</td>
                  <td>{repo.owner}</td>
                  <td>{repo.language || "N/A"}</td>
                  <td>
                    <a href={repo.url} target="_blank" rel="noreferrer">
                      {repo.url}
                    </a>
                  </td>
                  <td>{new Date(repo.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* pagination control */}
          <div style={{ marginTop: "15px" }}>
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              style={{ marginRight: "10px", padding: "6px 12px" }}
            >
               Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              style={{ marginLeft: "10px", padding: "6px 12px" }}
            >
              Next 
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;

