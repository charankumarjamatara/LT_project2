
import { useState, useEffect } from "react";
import { getAll } from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getAll("tournaments"),
      getAll("teams"),
      getAll("players"),
      getAll("matches"),
      getAll("results"),
    ])
      .then(([tournamentData, teamData, playerData, matchData, resultData]) => {
        if (isMounted) {
          setTournaments(tournamentData);
          setTeams(teamData);
          setPlayers(playerData);
          setMatches(matchData);
          setResults(resultData);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Could not load dashboard data. Check JSON Server.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = [
    { title: "Tournaments", count: tournaments.length },
    { title: "Teams", count: teams.length },
    { title: "Players", count: players.length },
    { title: "Matches", count: matches.length },
    { title: "Results", count: results.length },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="dashboard-label">OVERVIEW</p>
          <h1>Sports Tournament Dashboard</h1>
          <p className="dashboard-description">
            Manage tournaments, teams, players, matches and results.
          </p>
        </div>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="dashboard-section-heading">
        <h2>Overview</h2>
        <p>Your current tournament statistics</p>
      </div>

      <div className="dashboard-cards">
        {cards.map((card) => (
          <div className="dashboard-card" key={card.title}>
            <div className="dashboard-card-top">
              <span className="dashboard-card-title">{card.title}</span>
              <span className="dashboard-card-dot"></span>
            </div>

            <p className="dashboard-count">{card.count}</p>

            <p className="dashboard-card-footer">
              Total {card.title.toLowerCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
