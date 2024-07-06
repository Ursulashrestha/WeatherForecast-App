import React, { useState, useRef, useEffect } from "react";
import { fetchWeather } from "./api/fetchWeather";
import "./App.css"; // Importing the CSS file for the switch

const App = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [cityName, setCityName] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [unit, setUnit] = useState("C");
  const recentSearchesRef = useRef(null);

  useEffect(() => {
    const savedUnit = localStorage.getItem("temperatureUnit");
    if (savedUnit) {
      setUnit(savedUnit);
    }

    const handleClickOutside = (event) => {
      if (recentSearchesRef.current && !recentSearchesRef.current.contains(event.target)) {
        setShowRecentSearches(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchData = async (city) => {
    setLoading(true);
    try {
      const data = await fetchWeather(city);
      setWeatherData(data);
      setError(null);

      if (!recentSearches.includes(city)) {
        setRecentSearches([city, ...recentSearches].slice(0, 5)); // Keep only the last 5 searches
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchData(cityName);
      setCityName("");
      setShowRecentSearches(false);
    }
  };

  const handleRecentSearchClick = (city) => {
    fetchData(city);
    setCityName("");
    setShowRecentSearches(false);
  };

  const handleInputChange = (e) => {
    setCityName(e.target.value);
    setShowRecentSearches(e.target.value !== "");
  };

  const toggleUnit = () => {
    const newUnit = unit === "C" ? "F" : "C";
    setUnit(newUnit);
    localStorage.setItem("temperatureUnit", newUnit);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600 p-4">
      <div className="w-full max-w-md mx-auto relative bg-white rounded-lg shadow-lg p-6">
        <input
          type="text"
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          placeholder="Enter city name..."
          value={cityName}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowRecentSearches(cityName !== "")}
        />
        <div className="flex items-center justify-center mb-4">
          <span className="mr-2">Celsius</span>
          <label className="switch">
            <input type="checkbox" checked={unit === "F"} onChange={toggleUnit} />
            <span className="slider round"></span>
          </label>
          <span className="ml-2">Fahrenheit</span>
        </div>
        {showRecentSearches && recentSearches.length > 0 && (
          <div
            className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 z-10"
            ref={recentSearchesRef}
          >
            {recentSearches.map((city, index) => (
              <div
                key={index}
                className="p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleRecentSearchClick(city)}
              >
                {city}
              </div>
            ))}
          </div>
        )}
        {loading && <div className="text-center mb-4">Loading...</div>}
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {weatherData && (
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-2">
              {weatherData.location.name}, {weatherData.location.region},{" "}
              {weatherData.location.country}
            </h2>
            <p className="text-gray-700 text-lg">
              Temperature: {unit === "C" ? weatherData.current.temp_c : weatherData.current.temp_f} °{unit}
            </p>
            <p className="text-gray-700 text-lg">
              Condition: {weatherData.current.condition.text}
            </p>
            <img
              className="mx-auto my-4"
              src={weatherData.current.condition.icon}
              alt={weatherData.current.condition.text}
            />
            <p className="text-gray-700 text-lg">Humidity: {weatherData.current.humidity} %</p>
            <p className="text-gray-700 text-lg">Pressure: {weatherData.current.pressure_mb} mb</p>
            <p className="text-gray-700 text-lg">Visibility: {weatherData.current.vis_km} km</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
