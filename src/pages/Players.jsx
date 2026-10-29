
import { useState, useEffect } from "react";
import {
  getAll,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../services/api";

import "./Players.css";

function Players() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [teamId, setTeamId] = useState("");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load players
  const loadPlayers = async () => {
    try {
      const data = await getAll("players");
      setPlayers(data);
    } catch {
      setError("Could not load players.");
    } finally {
      setLoading(false);
    }
  };

  // Load teams and tournaments
  const loadRelatedData = async () => {
    try {
      const [teamData, tournamentData] = await Promise.all([
        getAll("teams"),
        getAll("tournaments"),
      ]);

      setTeams(teamData);
      setTournaments(tournamentData);
    } catch {
      setError("Could not load teams or tournaments.");
    }
  };

  useEffect(() => {
  const loadData = async () => {
    await loadPlayers();
    await loadRelatedData();
  };

  loadData();
}, []);

  // Clear form
  const clearForm = () => {
    setName("");
    setAge("");
    setTeamId("");
    setEditingId(null);
    setError("");
  };

  // Add or update player
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !age || !teamId) {
      setError("Please fill in all fields.");
      return;
    }

    if (Number(age) < 1 || Number(age) > 100) {
      setError("Enter an age between 1 and 100.");
      return;
    }

    const playerData = {
      name: name.trim(),
      age: Number(age),
      teamId,
    };

    try {
      if (editingId === null) {
        await createRecord("players", playerData);
      } else {
        await updateRecord("players", editingId, playerData);
      }

      clearForm();
      await loadPlayers();
    } catch {
      setError("Could not save player.");
    }
  };

  // Edit player
  const handleEdit = (player) => {
    setName(player.name);
    setAge(String(player.age));
    setTeamId(String(player.teamId));
    setEditingId(player.id);
    setError("");
  };

  // Delete player
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this player?"
    );

    if (!confirmed) return;

    try {
      await deleteRecord("players", id);

      if (String(editingId) === String(id)) {
        clearForm();
      }

      await loadPlayers();
    } catch {
      setError("Could not delete player.");
    }
  };

  // Find a team's name
  const getTeamName = (id) => {
    const team = teams.find(
      (item) => String(item.id) === String(id)
    );

    return team ? team.name : "Unknown team";
  };

  // Find a tournament's name through the team
  const getTournamentName = (id) => {
    const team = teams.find(
      (item) => String(item.id) === String(id)
    );

    if (!team) return "Unknown tournament";

    const tournament = tournaments.find(
      (item) => String(item.id) === String(team.tournamentId)
    );

    return tournament ? tournament.name : "Unknown tournament";
  };

  // Search players
  const filteredPlayers = players.filter((player) => {
    const teamName = getTeamName(player.teamId);
    const tournamentName = getTournamentName(player.teamId);
    const searchText = search.toLowerCase();

    return (
      player.name?.toLowerCase().includes(searchText) ||
      String(player.age).includes(searchText) ||
      teamName.toLowerCase().includes(searchText) ||
      tournamentName.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="players-page">
      <div className="players-page-header">
        <div>
          <p className="players-eyebrow">MANAGEMENT</p>
          <h1>Players</h1>
          <p className="players-subtitle">
            Register and manage tournament players.
          </p>
        </div>

        <div className="players-total">
          <span>Total players</span>
          <strong>{players.length}</strong>
        </div>
      </div>

      {error && <p className="players-error">{error}</p>}

      <div className="players-layout">
        <section className="players-form-card">
          <div className="players-card-heading">
            <h2>{editingId === null ? "Register Player" : "Edit Player"}</h2>
            <p>Enter the player details below.</p>
          </div>

          <form className="players-form" onSubmit={handleSubmit}>
            <label htmlFor="player-name">Player Name</label>
            <input
              id="player-name"
              type="text"
              placeholder="Enter player name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <label htmlFor="player-age">Age</label>
            <input
              id="player-age"
              type="number"
              min="1"
              max="100"
              placeholder="Enter age"
              value={age}
              onChange={(event) => setAge(event.target.value)}
              required
            />

            <label htmlFor="player-team">Team</label>
            <select
              id="player-team"
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
              required
            >
              <option value="">Select team</option>

              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <div className="players-form-actions">
              <button type="submit" className="players-primary-button">
                {editingId === null ? "Register Player" : "Update Player"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="players-cancel-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="players-list-card">
          <div className="players-list-heading">
            <div>
              <h2>Registered Players</h2>
              <p>{filteredPlayers.length} players found</p>
            </div>

            <input
              className="players-search"
              type="search"
              placeholder="Search players..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search players"
            />
          </div>

          {loading ? (
            <p className="players-empty">Loading players...</p>
          ) : filteredPlayers.length === 0 ? (
            <p className="players-empty">
              {search ? "No matching players found." : "No players registered yet."}
            </p>
          ) : (
            <div className="players-table-wrapper">
              <table className="players-table">
                <thead>
                  <tr>
                    <th>Player Name</th>
                    <th>Age</th>
                    <th>Team</th>
                    <th>Tournament</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.id}>
                      <td className="players-name-cell">{player.name}</td>
                      <td>{player.age}</td>
                      <td>
                        <span className="players-team-label">
                          {getTeamName(player.teamId)}
                        </span>
                      </td>
                      <td>{getTournamentName(player.teamId)}</td>
                      <td>
                        <div className="players-row-actions">
                          <button
                            type="button"
                            className="players-edit-button"
                            onClick={() => handleEdit(player)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="players-delete-button"
                            onClick={() => handleDelete(player.id)}
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

export default Players;
