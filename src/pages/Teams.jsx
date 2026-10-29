
import { useState, useEffect } from "react";
import {
  getAll,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../services/api";

import "./Teams.css";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  const [name, setName] = useState("");
  const [coach, setCoach] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load teams
  const loadTeams = async () => {
    try {
      const data = await getAll("teams");
      setTeams(data);
    } catch {
      setError("Could not load teams.");
    } finally {
      setLoading(false);
    }
  };

  // Load tournaments for the dropdown
  const loadTournaments = async () => {
    try {
      const data = await getAll("tournaments");
      setTournaments(data);
    } catch {
      setError("Could not load tournaments.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadTeams();
      await loadTournaments();
    };

    loadData();
  }, []);

  // Clear form
  const clearForm = () => {
    setName("");
    setCoach("");
    setTournamentId("");
    setEditingId(null);
    setError("");
  };

  // Add or update team
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !coach.trim() || !tournamentId) {
      setError("Please fill in all fields.");
      return;
    }

    const teamData = {
      name: name.trim(),
      coach: coach.trim(),
      tournamentId,
    };

    try {
      if (editingId === null) {
        await createRecord("teams", teamData);
      } else {
        await updateRecord("teams", editingId, teamData);
      }

      clearForm();
      await loadTeams();
    } catch {
      setError("Could not save team.");
    }
  };

  // Edit team
  const handleEdit = (team) => {
    setName(team.name);
    setCoach(team.coach);
    setTournamentId(String(team.tournamentId));
    setEditingId(team.id);
    setError("");
  };

  // Delete team
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this team?"
    );

    if (!confirmed) return;

    try {
      await deleteRecord("teams", id);

      if (String(editingId) === String(id)) {
        clearForm();
      }

      await loadTeams();
    } catch {
      setError("Could not delete team.");
    }
  };

  // Search teams
  const filteredTeams = teams.filter((team) => {
    const tournament = tournaments.find(
      (item) => String(item.id) === String(team.tournamentId)
    );

    const searchText = search.toLowerCase();

    return (
      team.name?.toLowerCase().includes(searchText) ||
      team.coach?.toLowerCase().includes(searchText) ||
      tournament?.name?.toLowerCase().includes(searchText)
    );
  });

  // Get tournament name
  const getTournamentName = (id) => {
    const tournament = tournaments.find(
      (item) => String(item.id) === String(id)
    );

    return tournament ? tournament.name : "Unknown tournament";
  };

  return (
    <div className="teams-page">
      <div className="teams-page-header">
        <div>
          <p className="teams-eyebrow">MANAGEMENT</p>
          <h1>Teams</h1>
          <p className="teams-subtitle">
            Register and manage tournament teams.
          </p>
        </div>

        <div className="teams-total">
          <span>Total teams</span>
          <strong>{teams.length}</strong>
        </div>
      </div>

      {error && <p className="teams-error">{error}</p>}

      <div className="teams-layout">
        <section className="teams-form-card">
          <div className="teams-card-heading">
            <h2>{editingId === null ? "Register Team" : "Edit Team"}</h2>
            <p>Enter the team details below.</p>
          </div>

          <form className="teams-form" onSubmit={handleSubmit}>
            <label htmlFor="team-name">Team Name</label>
            <input
              id="team-name"
              type="text"
              placeholder="Enter team name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <label htmlFor="team-coach">Coach Name</label>
            <input
              id="team-coach"
              type="text"
              placeholder="Enter coach name"
              value={coach}
              onChange={(event) => setCoach(event.target.value)}
              required
            />

            <label htmlFor="team-tournament">Tournament</label>
            <select
              id="team-tournament"
              value={tournamentId}
              onChange={(event) => setTournamentId(event.target.value)}
              required
            >
              <option value="">Select tournament</option>

              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>

            <div className="teams-form-actions">
              <button type="submit" className="teams-primary-button">
                {editingId === null ? "Register Team" : "Update Team"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="teams-cancel-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="teams-list-card">
          <div className="teams-list-heading">
            <div>
              <h2>Registered Teams</h2>
              <p>{filteredTeams.length} teams found</p>
            </div>

            <input
              className="teams-search"
              type="search"
              placeholder="Search teams..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search teams"
            />
          </div>

          {loading ? (
            <p className="teams-empty">Loading teams...</p>
          ) : filteredTeams.length === 0 ? (
            <p className="teams-empty">
              {search ? "No matching teams found." : "No teams registered yet."}
            </p>
          ) : (
            <div className="teams-table-wrapper">
              <table className="teams-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Coach</th>
                    <th>Tournament</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTeams.map((team) => (
                    <tr key={team.id}>
                      <td className="teams-name-cell">{team.name}</td>
                      <td>{team.coach}</td>
                      <td>
                        <span className="teams-tournament-label">
                          {getTournamentName(team.tournamentId)}
                        </span>
                      </td>
                      <td>
                        <div className="teams-row-actions">
                          <button
                            type="button"
                            className="teams-edit-button"
                            onClick={() => handleEdit(team)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="teams-delete-button"
                            onClick={() => handleDelete(team.id)}
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

export default Teams;
