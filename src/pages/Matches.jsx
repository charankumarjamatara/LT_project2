
import { useState, useEffect } from "react";
import {
  getAll,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../services/api";

import "./Matches.css";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);

  const [tournamentId, setTournamentId] = useState("");
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState("Scheduled");

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load matches
  const loadMatches = async () => {
    try {
      const data = await getAll("matches");
      setMatches(data);
      setError("");
    } catch {
      setError("Could not load matches.");
    } finally {
      setLoading(false);
    }
  };

  // Load tournaments and teams
  const loadRelatedData = async () => {
    try {
      const [tournamentData, teamData] = await Promise.all([
        getAll("tournaments"),
        getAll("teams"),
      ]);

      setTournaments(tournamentData);
      setTeams(teamData);
    } catch {
      setError("Could not load tournaments or teams.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadMatches(), loadRelatedData()]);
    };

    loadData();
  }, []);

  // Clear form
  const clearForm = () => {
    setTournamentId("");
    setTeam1("");
    setTeam2("");
    setDate("");
    setTime("");
    setStatus("Scheduled");
    setEditingId(null);
    setError("");
  };

  // Add or update match
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!tournamentId || !team1 || !team2 || !date || !time) {
      setError("Please fill in all fields.");
      return;
    }

    if (team1 === team2) {
      setError("Please select two different teams.");
      return;
    }

    const selectedTeams = teams.filter(
      (team) =>
        String(team.id) === team1 ||
        String(team.id) === team2
    );

    if (
      selectedTeams.length !== 2 ||
      selectedTeams.some(
        (team) => String(team.tournamentId) !== tournamentId
      )
    ) {
      setError("Select teams belonging to the chosen tournament.");
      return;
    }

    const matchData = {
      tournamentId,
      team1,
      team2,
      date,
      time,
      status,
    };

    try {
      if (editingId === null) {
        await createRecord("matches", matchData);
      } else {
        await updateRecord("matches", editingId, matchData);
      }

      clearForm();
      await loadMatches();
    } catch {
      setError("Could not save match.");
    }
  };

  // Edit match
  const handleEdit = (match) => {
    setTournamentId(String(match.tournamentId));
    setTeam1(String(match.team1));
    setTeam2(String(match.team2));
    setDate(match.date);
    setTime(match.time);
    setStatus(match.status || "Scheduled");
    setEditingId(match.id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete match
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this match?")) {
      return;
    }

    try {
      await deleteRecord("matches", id);

      if (String(editingId) === String(id)) {
        clearForm();
      }

      await loadMatches();
    } catch {
      setError("Could not delete match.");
    }
  };

  // Get team name
  const getTeamName = (id) => {
    const team = teams.find(
      (item) => String(item.id) === String(id)
    );

    return team ? team.name : "Unknown team";
  };

  // Get tournament name
  const getTournamentName = (id) => {
    const tournament = tournaments.find(
      (item) => String(item.id) === String(id)
    );

    return tournament ? tournament.name : "Unknown tournament";
  };

  // Teams belonging to selected tournament
  const availableTeams = teams.filter(
    (team) => String(team.tournamentId) === tournamentId
  );

  // Search matches
  const filteredMatches = matches.filter((match) => {
    const searchText = search.toLowerCase();

    return (
      getTournamentName(match.tournamentId).toLowerCase().includes(searchText) ||
      getTeamName(match.team1).toLowerCase().includes(searchText) ||
      getTeamName(match.team2).toLowerCase().includes(searchText) ||
      match.date?.includes(searchText) ||
      match.status?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="matches-page">

      {/* Page Header */}
      <div className="matches-page-header">
        <div>
          <p className="matches-eyebrow">MANAGEMENT</p>
          <h1>Matches</h1>
          <p className="matches-subtitle">
            Schedule and manage tournament matches.
          </p>
        </div>

        <div className="matches-total">
          <span>Total matches</span>
          <strong>{matches.length}</strong>
        </div>
      </div>

      {error && <p className="matches-error">{error}</p>}

      <div className="matches-layout">

        {/* Match Form - Existing Functionality */}
        <section className="matches-form-card">
          <div className="matches-card-heading">
            <h2>{editingId === null ? "Schedule Match" : "Edit Match"}</h2>
            <p>Enter the match details below.</p>
          </div>

          <form className="matches-form" onSubmit={handleSubmit}>
            <label htmlFor="match-tournament">Tournament</label>
            <select
              id="match-tournament"
              value={tournamentId}
              onChange={(event) => {
                setTournamentId(event.target.value);
                setTeam1("");
                setTeam2("");
              }}
              required
            >
              <option value="">Select tournament</option>
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>

            <label htmlFor="match-team1">First Team</label>
            <select
              id="match-team1"
              value={team1}
              onChange={(event) => setTeam1(event.target.value)}
              required
            >
              <option value="">Select first team</option>
              {availableTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <label htmlFor="match-team2">Second Team</label>
            <select
              id="match-team2"
              value={team2}
              onChange={(event) => setTeam2(event.target.value)}
              required
            >
              <option value="">Select second team</option>
              {availableTeams
                .filter((team) => String(team.id) !== team1)
                .map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
            </select>

            <label htmlFor="match-date">Match Date</label>
            <input
              id="match-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            <label htmlFor="match-time">Match Time</label>
            <input
              id="match-time"
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />

            <label htmlFor="match-status">Status</label>
            <select
              id="match-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="matches-form-actions">
              <button type="submit" className="matches-primary-button">
                {editingId === null ? "Schedule Match" : "Update Match"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="matches-cancel-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Matches Card Grid */}
        <section className="matches-list-card">
          <div className="matches-list-heading">
            <div>
              <h2>All Matches</h2>
              <p>{filteredMatches.length} matches found</p>
            </div>

            <input
              type="search"
              className="matches-search"
              placeholder="Search matches..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search matches"
            />
          </div>

          {loading ? (
            <p className="matches-empty">Loading matches...</p>
          ) : filteredMatches.length === 0 ? (
            <p className="matches-empty">
              {search
                ? "No matching matches found."
                : "No matches scheduled yet."}
            </p>
          ) : (
            <div className="matches-grid">
              {filteredMatches.map((match) => {
                const matchStatus = match.status || "Scheduled";

                return (
                  <article className="match-card" key={match.id}>

                    <div className="match-card-top">
                      <span className="match-tournament-label">
                        {getTournamentName(match.tournamentId)}
                      </span>

                      <span
                        className={`matches-status matches-status-${matchStatus.toLowerCase()}`}
                      >
                        {matchStatus}
                      </span>
                    </div>

                    <h3 className="match-card-teams">
                      {getTeamName(match.team1)}
                      <span>vs</span>
                      {getTeamName(match.team2)}
                    </h3>

                    <div className="match-card-details">
                      <div>
                        <span>Date</span>
                        <strong>{match.date}</strong>
                      </div>

                      <div>
                        <span>Time</span>
                        <strong>{match.time}</strong>
                      </div>
                    </div>

                    <div className="match-card-actions">
                      <button
                        type="button"
                        className="matches-edit-button"
                        onClick={() => handleEdit(match)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="matches-delete-button"
                        onClick={() => handleDelete(match.id)}
                      >
                        Delete
                      </button>
                    </div>

                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Matches;
