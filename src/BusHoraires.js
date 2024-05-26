import React, { useState, useEffect } from "react";

const BusHoraires = () => {
  const [horaires, setHoraires] = useState({});
  const [loading, setLoading] = useState(false);
  const [stopCode, setStopCode] = useState("SEM:2273");
  const [error, setError] = useState(null);
  const [stopName, setStopName] = useState("");

  const fetchHoraires = async () => {
    setLoading(true);
    setError(null);
    setHoraires({});
    try {
      const response = await fetch(
        `https://data.mobilites-m.fr/api/routers/default/index/stops/${stopCode}/stoptimes`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      const secondsToTime = (seconds) => {
        const date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
      };

      // Regrouper les horaires par terminus
      const groupedHoraires = data.reduce((acc, pattern) => {
        const terminus = pattern.pattern.lastStopName;
        const horairesList = pattern.times.map((time_info) => ({
          stopName: time_info.stopName,
          busDesc: pattern.pattern.desc,
          arrivalTime: secondsToTime(time_info.realtimeArrival),
        }));
        if (!acc[terminus]) {
          acc[terminus] = [];
        }
        acc[terminus] = acc[terminus].concat(horairesList);
        return acc;
      }, {});

      // Mettre à jour le nom de l'arrêt avec le premier stopName trouvé
      if (data.length > 0 && data[0].times.length > 0) {
        setStopName(data[0].times[0].stopName);
      }

      setHoraires(groupedHoraires);
    } catch (error) {
      console.error("Erreur lors de la récupération des horaires :", error);
      setError("Aucun arrêt ne semble correspondre à ce code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHoraires();
  }, []);

  return (
    <div>
      {error ? (
        <h1>Oupsy 😅</h1>
      ) : (
        <h1>
          <i className="fas fa-bus"></i> Horaires des prochains bus à l'arrêt{" "}
          {stopName || "Chavant"}
        </h1>
      )}
      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        Object.keys(horaires).map((terminus, index) => (
          <div key={index}>
            <h2 className="terminus">Terminus: {terminus}</h2>
            <hr />
            <ul>
              {horaires[terminus].map((horaire, i) => (
                <li key={i}>{horaire.arrivalTime}</li>
              ))}
            </ul>
            <hr />
          </div>
        ))
      )}
      <div className="input-container">
        <label htmlFor="stopCode">Code de l'arrêt: </label>
        <input
          type="text"
          id="stopCode"
          value={stopCode}
          onChange={(e) => setStopCode(e.target.value)}
        />
        <button onClick={fetchHoraires}>Chercher les horaires</button>
      </div>
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
