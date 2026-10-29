
import { useState, useEffect } from "react";
import {
  getAll,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../services/api";

import "./Results.css";

function Results() {
  const [results, setResults] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);

  const [matchId, setMatchId] = useState("");
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [resultData, matchData, teamData] = await Promise.all([
        getAll("results"),
        getAll("matches"),
        getAll("teams"),
      ]);

      setResults(resultData);
      setMatches(matchData);
      setTeams(teamData);
    } catch {
      setError("Could not load results. Check JSON Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const loadData = async () => {
    await loadData();
  };

  loadData();
}, []);

  const getMatch = (id) => {
    return matches.find(
      (match) => String(match.id) === String(id)
    );
  };

  const getTeamName = (id) => {
    const team = teams.find(
      (item) => String(item.id) === String(id)
    );

    return team ? team.name : "Unknown team";
  };

  const getMatchName = (match) => {
    if (!match) {
      return "Unknown match";
    }

    return `${getTeamName(match.team1)} vs ${getTeamName(match.team2)}`;
  };

  const getOutcome = (firstScore, secondScore) => {
    if (Number(firstScore) > Number(secondScore)) {
      return "Team 1 Wins";
    }

    if (Number(secondScore) > Number(firstScore)) {
      return "Team 2 Wins";
    }

    return "Draw";
  };

  const clearForm = () => {
    setMatchId("");
    setScore1("");
    setScore2("");
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (score1 === "" || score2 === "" || !matchId) {
      setError("Please fill in all fields.");
      return;
    }

    if (
      Number(score1) < 0 ||
      Number(score2) < 0 ||
      !Number.isInteger(Number(score1)) ||
      !Number.isInteger(Number(score2))
    ) {
      setError("Scores must be non-negative whole numbers.");
      return;
    }

    const selectedMatch = getMatch(matchId);

    if (!selectedMatch || selectedMatch.status !== "Completed") {
      setError("Select a completed match.");
      return;
    }

    const resultData = {
      matchId,
      team1Score: Number(score1),
      team2Score: Number(score2),
      outcome: getOutcome(score1, score2),
    };

    try {
      if (editingId === null) {
        await createRecord("results", resultData);
      } else {
        await updateRecord("results", editingId, resultData);
      }

      clearForm();
      await loadData();
    } catch {
      setError("Could not save the result.");
    }
  };

  const handleEdit = (result) => {
    setMatchId(String(result.matchId));
    setScore1(String(result.team1Score));
    setScore2(String(result.team2Score));
    setEditingId(result.id);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this result?")) {
      return;
    }

    try {
      await deleteRecord("results", id);

      if (String(editingId) === String(id)) {
        clearForm();
      }

      await loadData();
    } catch {
      setError("Could not delete the result.");
    }
  };

  const filteredResults = results.filter((result) => {
    const match = getMatch(result.matchId);
    const matchName = getMatchName(match).toLowerCase();
    const outcome = getOutcome(
      result.team1Score,
      result.team2Score
    ).toLowerCase();

    return (
      matchName.includes(search.toLowerCase()) ||
      outcome.includes(search.toLowerCase())
    );
  });

  return (
    <div className="results-page">
      <div className="results-page-header">
        <div>
          <p className="results-eyebrow">MANAGEMENT</p>
          <h1>Results</h1>
          <p className="results-subtitle">
            Record and manage completed match results.
          </p>
        </div>

        <div className="results-total">
          <span>Total results</span>
          <strong>{results.length}</strong>
        </div>
      </div>

      {error && <p className="results-error">{error}</p>}

      <div className="results-layout">
        <section className="results-form-card">
          <div className="results-card-heading">
            <h2>{editingId === null ? "Record Result" : "Edit Result"}</h2>
            <p>Enter the final scores below.</p>
          </div>

          <form className="results-form" onSubmit={handleSubmit}>
            <label htmlFor="result-match">Completed Match</label>

            <select
              id="result-match"
              value={matchId}
              onChange={(event) => setMatchId(event.target.value)}
              required
            >
              <option value="">Select completed match</option>

              {matches
                .filter((match) => {
                  const alreadyRecorded = results.some(
                    (result) =>
                      String(result.matchId) === String(match.id) &&
                      String(result.id) !== String(editingId)
                  );

                  return (
                    match.status === "Completed" &&
                    (!alreadyRecorded ||
                      String(match.id) === matchId)
                  );
                })
                .map((match) => (
                  <option key={match.id} value={match.id}>
                    {getMatchName(match)}
                  </option>
                ))}
            </select>

            <label htmlFor="result-score1">First Team Score</label>
            <input
              id="result-score1"
              type="number"
              min="0"
              step="1"
              value={score1}
              onChange={(event) => setScore1(event.target.value)}
              placeholder="Enter first score"
              required
            />

            <label htmlFor="result-score2">Second Team Score</label>
            <input
              id="result-score2"
              type="number"
              min="0"
              step="1"
              value={score2}
              onChange={(event) => setScore2(event.target.value)}
              placeholder="Enter second score"
              required
            />

            {score1 !== "" && score2 !== "" && Number(score1) >= 0 &&
              Number(score2) >= 0 && (
                <div className="results-outcome-preview">
                  <span>Outcome</span>
                  <strong>{getOutcome(score1, score2)}</strong>
                </div>
              )}

            <div className="results-form-actions">
              <button type="submit" className="results-primary-button">
                {editingId === null ? "Save Result" : "Update Result"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="results-cancel-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="results-list-card">
          <div className="results-list-heading">
            <div>
              <h2>Recorded Results</h2>
              <p>{filteredResults.length} results found</p>
            </div>

            <input
              className="results-search"
              type="search"
              placeholder="Search results..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search results"
            />
          </div>

          {loading ? (
            <p className="results-empty">Loading results...</p>
          ) : filteredResults.length === 0 ? (
            <p className="results-empty">
              {search ? "No matching results found." : "No results recorded yet."}
            </p>
          ) : (
            <div className="results-table-wrapper">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Match</th>
                    <th>Score</th>
                    <th>Outcome</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredResults.map((result) => {
                    const outcome = getOutcome(
                      result.team1Score,
                      result.team2Score
                    );

                    return (
                      <tr key={result.id}>
                        <td>{getMatchName(getMatch(result.matchId))}</td>

                        <td className="results-score">
                          {result.team1Score} - {result.team2Score}
                        </td>

                        <td>
                          <span
                            className={`results-outcome results-outcome-${
                              outcome === "Draw"
                                ? "draw"
                                : "winner"
                            }`}
                          >
                            {outcome}
                          </span>
                        </td>

                        <td>
                          <div className="results-row-actions">
                            <button
                              type="button"
                              className="results-edit-button"
                              onClick={() => handleEdit(result)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="results-delete-button"
                              onClick={() => handleDelete(result.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Results;
