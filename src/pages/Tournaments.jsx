
import { useState, useEffect } from "react";
import {
  getAll,
  createRecord,
  updateRecord,
  deleteRecord,
} from "../services/api";

import "./Tournaments.css";

function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load tournaments from JSON Server
  const loadTournaments = async () => {
    try {
      const data = await getAll("tournaments");
      setTournaments(data);
      setError("");
    } catch {
      setError("Could not load tournaments. Check JSON Server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getAll("tournaments")
      .then((data) => {
        if (isMounted) {
          setTournaments(data);
          setError("");
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Could not load tournaments. Check JSON Server.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Clear the form
  const clearForm = () => {
    setName("");
    setSport("");
    setDate("");
    setLocation("");
    setEditingId(null);
    setError("");
  };

  // Add or update a tournament
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !sport || !date || !location.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const tournamentData = {
      name: name.trim(),
      sport,
      date,
      location: location.trim(),
    };

    try {
      if (editingId === null) {
        await createRecord("tournaments", tournamentData);
      } else {
        await updateRecord("tournaments", editingId, tournamentData);
      }

      clearForm();
      await loadTournaments();
    } catch {
      setError("Could not save tournament.");
    }
  };

  // Load selected tournament into the form
  const handleEdit = (tournament) => {
    setName(tournament.name);
    setSport(tournament.sport);
    setDate(tournament.date);
    setLocation(tournament.location);
    setEditingId(tournament.id);
    setError("");
  };

  // Delete a tournament
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tournament?"
    );

    if (!confirmed) return;

    try {
      await deleteRecord("tournaments", id);
      await loadTournaments();

      if (String(editingId) === String(id)) {
        clearForm();
      }
    } catch {
      setError("Could not delete tournament.");
    }
  };

  // Search tournaments
  const filteredTournaments = tournaments.filter((tournament) => {
    const searchText = search.toLowerCase();

    return (
      tournament.name?.toLowerCase().includes(searchText) ||
      tournament.sport?.toLowerCase().includes(searchText) ||
      tournament.location?.toLowerCase().includes(searchText) ||
      tournament.date?.includes(searchText)
    );
  });

  return (
    <div className="tournaments-page">
      <div className="tournament-page-header">
        <div>
          <p className="tournament-eyebrow">MANAGEMENT</p>
          <h1>Tournaments</h1>
          <p className="tournament-subtitle">
            Create and manage your sports tournaments.
          </p>
        </div>

        <div className="tournament-total">
          <span>Total tournaments</span>
          <strong>{tournaments.length}</strong>
        </div>
      </div>

      {error && <p className="tournament-error">{error}</p>}

      <div className="tournament-layout">
        <section className="tournament-form-card">
          <div className="tournament-card-heading">
            <h2>
              {editingId === null ? "Add Tournament" : "Edit Tournament"}
            </h2>
            <p>Enter the tournament details below.</p>
          </div>

          <form onSubmit={handleSubmit} className="tournament-form">
            <label htmlFor="tournament-name">Tournament Name</label>
            <input
              id="tournament-name"
              type="text"
              placeholder="e.g. College Football Cup"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <label htmlFor="tournament-sport">Sport</label>
            <select
              id="tournament-sport"
              value={sport}
              onChange={(event) => setSport(event.target.value)}
              required
            >
              <option value="">Select sport</option>
              <option value="Cricket">Cricket</option>
              <option value="Football">Football</option>
              <option value="Basketball">Basketball</option>
              <option value="Volleyball">Volleyball</option>
              <option value="Badminton">Badminton</option>
              <option value="Tennis">Tennis</option>
              <option value="Other">Other</option>
            </select>

            <label htmlFor="tournament-date">Tournament Date</label>
            <input
              id="tournament-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />

            <label htmlFor="tournament-location">Location</label>
            <input
              id="tournament-location"
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              required
            />

            <div className="tournament-form-actions">
              <button type="submit" className="tournament-primary-button">
                {editingId === null ? "Add Tournament" : "Update Tournament"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="tournament-cancel-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="tournament-list-card">
          <div className="tournament-list-heading">
            <div>
              <h2>All Tournaments</h2>
              <p>
                {filteredTournaments.length} tournament
                {filteredTournaments.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <input
              className="tournament-search"
              type="search"
              placeholder="Search tournaments..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search tournaments"
            />
          </div>

          {loading ? (
            <p className="tournament-empty">Loading tournaments...</p>
          ) : filteredTournaments.length === 0 ? (
            <p className="tournament-empty">
              {search
                ? "No tournaments match your search."
                : "No tournaments added yet."}
            </p>
          ) : (
            <div className="tournament-table-wrapper">
              <table className="tournament-table">
                <thead>
                  <tr>
                    <th>Tournament</th>
                    <th>Sport</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTournaments.map((tournament) => (
                    <tr key={tournament.id}>
                      <td className="tournament-name-cell">
                        {tournament.name}
                      </td>
                      <td>
                        <span className="sport-label">
                          {tournament.sport}
                        </span>
                      </td>
                      <td>{tournament.date}</td>
                      <td>{tournament.location}</td>
                      <td>
                        <div className="tournament-row-actions">
                          <button
                            type="button"
                            className="tournament-edit-button"
                            onClick={() => handleEdit(tournament)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="tournament-delete-button"
                            onClick={() => handleDelete(tournament.id)}
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

export default Tournaments;
