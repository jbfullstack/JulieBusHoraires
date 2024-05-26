import React, { useState, useEffect } from "react";

const BusHoraires = () => {
  const [horaires, setHoraires] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const secondsToTime = (seconds) => {
      const date = new Date(0);
      date.setSeconds(seconds);
      return date.toISOString().substr(11, 8);
    };

    const fetchHoraires = async () => {
      try {
        const response = await fetch(
          "https://data.mobilites-m.fr/api/routers/default/index/stops/SEM:2273/stoptimes"
        );
        const data = await response.json();

        const horairesData = data
          .map((pattern) => {
            return pattern.times.map((time_info) => ({
              stopName: time_info.stopName,
              busDesc: pattern.pattern.desc,
              arrivalTime: secondsToTime(time_info.realtimeArrival),
            }));
          })
          .flat();

        setHoraires(horairesData);
      } catch (error) {
        console.error("Erreur lors de la récupération des horaires :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHoraires();
  }, []);

  return (
    <div>
      <h1>
        <i className="fas fa-bus"></i> Horaires des prochains bus à l'arrêt
        Chavant
      </h1>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <ul>
          {horaires.map((horaire, index) => (
            <li key={index}>
              Prochain passage à l'arrêt {horaire.stopName} ({horaire.busDesc})
              : {horaire.arrivalTime}
            </li>
          ))}
        </ul>
      )}
      <footer>
        Fait pour Julie{" "}
        <span role="img" aria-label="fleur">
          🌸
        </span>
      </footer>
    </div>
  );
};

export default BusHoraires;
