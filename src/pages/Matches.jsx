
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

  const loadMatches = async () => {
    try {
      const data = await getAll("matches");
      setMatches(data);
    } catch {
      setError("Could not load matches.");
    } finally {
      setLoading(false);
    }
  };

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
    await loadMatches();
    await loadRelatedData();
  };

  loadData();
}, []);

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
        String(team.id) === team1 || String(team.id) === team2
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

  const handleEdit = (match) => {
    setTournamentId(String(match.tournamentId));
    setTeam1(String(match.team1));
    setTeam2(String(match.team2));
    setDate(match.date);
    setTime(match.time);
    setStatus(match.status || "Scheduled");
    setEditingId(match.id);
    setError("");
  };

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

  const getTeamName = (id) => {
    const team = teams.find(
      (item) => String(item.id) === String(id)
    );

    return team ? team.name : "Unknown team";
  };

  const getTournamentName = (id) => {
    const tournament = tournaments.find(
      (item) => String(item.id) === String(id)
    );

    return tournament ? tournament.name : "Unknown tournament";
  };

  const availableTeams = teams.filter(
    (team) => String(team.tournamentId) === tournamentId
  );

  const filteredMatches = matches.filter((match) => {
    const searchText = search.toLowerCase();

    return (
      getTournamentName(match.tournamentId)
        .toLowerCase()
        .includes(searchText) ||
      getTeamName(match.team1).toLowerCase().includes(searchText) ||
      getTeamName(match.team2).toLowerCase().includes(searchText) ||
      match.date?.includes(searchText) ||
      match.status?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="matches-page">
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
              {search ? "No matching matches found." : "No matches scheduled yet."}
            </p>
          ) : (
            <div className="matches-table-wrapper">
              <table className="matches-table">
                <thead>
                  <tr>
                    <th>Tournament</th>
                    <th>Teams</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMatches.map((match) => (
                    <tr key={match.id}>
                      <td>{getTournamentName(match.tournamentId)}</td>
                      <td>
                        <div className="matches-team-names">
                          <span>{getTeamName(match.team1)}</span>
                          <span className="matches-versus">vs</span>
                          <span>{getTeamName(match.team2)}</span>
                        </div>
                      </td>
                      <td>{match.date}</td>
                      <td>{match.time}</td>
                      <td>
                        <span
                          className={`matches-status matches-status-${(
                            match.status || "Scheduled"
                          ).toLowerCase()}`}
                        >
                          {match.status || "Scheduled"}
                        </span>
                      </td>
                      <td>
                        <div className="matches-row-actions">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Matches;
