import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import "./App.css";
import "./headerStyle.css";
import "./searchResultsDropdown.css";
import ApiData from "./Apidata";

function Header() {
  const supabase = createClient(
    "https://ksnouxckabitqorjucgz.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtzbm91eGNrYWJpdHFvcmp1Y2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ0MzM4ODgsImV4cCI6MjAzMDAwOTg4OH0.17MF1DByop1lCcnefGB8t3AcS1CGcJvbzunwY3QbK_c"
  );

  const navigate = useNavigate();
  // const location = useLocation();

  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user data:", error.message);
      } else {
        setUser(user);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) {
        setSearchResults([]);
        return;
      }

      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYzI3N2U4NzIyNjA4YTNjOGU1YWNjZmQ0ZTVmZDk0ZSIsInN1YiI6IjY2MTVkMjg2YWM0MTYxMDE3YzkyOTlhYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.SCbzx_EgdSfu_R2NVoQ8pGKqwIFfm8tXz-yd3HoLJX8'
        }
      };

      try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1&query=${searchTerm}`, options);
        const data = await response.json();
        setSearchResults(data.results || []);
        console.log(data.results);
      } catch (error) {
        console.error(error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSearchResults();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log("User signed out");
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm.trim()}`);
    }
  };

  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchResultClick = (result) => {
    navigate(`/apidata/${result.id}`, { state: result });
  };

  return (
    <>
      <header className="app-bar">
        <Link to="/" className="logo-link">
          <img className="app-bar__logo logo" src="filmdb.png" alt="logo" style={{ width: '100px' }} />
        </Link>
        <div className="app-bar__menu" onClick={toggleMenu}>
          <span className="app-bar__menu-icon">☰</span>
          <span>Menu</span>
        </div>
        {menuOpen && (
          <div className="header-menu">
            <ul className="menu-list">
              <li className="menu-item">
                <Link to="/popular">Popular</Link>
              </li>
              <li className="menu-item">
                <Link to="/toprated">Top Rated</Link>
              </li>
              <li className="menu-item">
                <Link to="/watchlist">Watchlist</Link>
              </li>
            </ul>
          </div>
        )}

        <div className="col mx-3 relative">
          <form onSubmit={handleSearch} className="d-flex">
            <input
              type="text"
              className="form-control form-control-sm me-2"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchInput}
            />
            <button className="btn btn-primary btn-sm" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </form>
          {searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item d-flex align-items-center"
                  onClick={() => handleSearchResultClick(result)}
                >
                  {result.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w185/${result.poster_path}`}
                      alt={result.title}
                      className="search-result-image"
                    />
                  )}
                  <span>{result.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="app-bar__watchlist">
          <Link to="/watchlist" className="nav-link">
            <span>Watchlist</span>
          </Link>
        </div>

        {user ? (
          <div className="logout-container">
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
            <Link to="/user" className="app-user-link">
              <span style={{ fontSize: "13px" }}>
                {user.user_metadata.name}
              </span>
            </Link>

          </div>
        ) : (
          <div className="app-bar__sign-in">
            <Link to="/signin" className="nav-link">
              <span>Sign In</span>
            </Link>
          </div>
        )}

        <div className="app-bar__language">
          <span>EN</span>
          <span>▼</span>
        </div>
      </header>

      {/* {location.pathname.startsWith("/movie/") && (
        <ApiData movieData={location.state} />
      )} */}
    </>
  );
}

export default Header;