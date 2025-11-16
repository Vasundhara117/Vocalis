// src/App.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";
import AuthScreen from "./AuthScreen"; 
import MainMenu from "./MainMenu";
import ChallengeScreen from "./ChallengeScreen";
import ProgressScreen from "./ProgressScreen";
import LevelSelect from "./LevelSelect";

function App() {
  const [currentScreen, setCurrentScreen] = useState("AUTH"); 
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); 
  const [selectedLevel, setSelectedLevel] = useState(1);

  // This cleans up old localStorage data on first load
  useEffect(() => {
    localStorage.removeItem("vocalisUser");
    localStorage.removeItem("vocalisToken");
  }, []);

  // This function is passed to AuthScreen.js
  const handleLogin = (userObject, authToken) => {
    setUser(userObject);
    setToken(authToken);
    localStorage.setItem("vocalisUser", JSON.stringify(userObject));
    localStorage.setItem("vocalisToken", authToken); 
    setCurrentScreen("MENU");
  };

  const handleStartChallenge = () => setCurrentScreen("LEVEL_SELECT");
  const handleShowProgress = () => setCurrentScreen("PROGRESS");
  const handleGoToMenu = () => setCurrentScreen("MENU");
  
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("vocalisUser");
    localStorage.removeItem("vocalisToken");
    setCurrentScreen("AUTH");
  };

  const handleGoToLevelSelect = () => setCurrentScreen("LEVEL_SELECT");

  const handleSelectLevel = (levelId) => {
    setSelectedLevel(levelId);
    setCurrentScreen("CHALLENGE");
  };

  const pageTransition = {
    type: "spring",
    stiffness: 300, 
    damping: 25     
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  return (
    <div className="App">
      <AnimatePresence mode="wait">
        
        {currentScreen === "AUTH" && (
          <motion.div key="auth" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{ width: '100%', position: 'absolute' }}>
            <AuthScreen onLogin={handleLogin} />
          </motion.div>
        )}

        {currentScreen === "MENU" && (
          <motion.div key="menu" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{ width: '100%', position: 'absolute' }}>
            <MainMenu
              user={user}
              token={token}
              onStartChallenge={handleStartChallenge}
              onShowProgress={handleShowProgress}
              onLogout={handleLogout}
            />
          </motion.div>
        )}

        {currentScreen === "LEVEL_SELECT" && (
          <motion.div key="level" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{ width: '100%', position: 'absolute' }}>
            <LevelSelect
              onSelectLevel={handleSelectLevel}
              onGoToMenu={handleGoToMenu}
            />
          </motion.div>
        )}

        {/* --- THIS BLOCK IS UPDATED --- */}
        {currentScreen === "CHALLENGE" && (
          <motion.div key="challenge" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{ width: '100%', position: 'absolute' }}>
            <ChallengeScreen
              token={token}
              onGoToMenu={handleGoToLevelSelect} 
              onGoToProgress={handleShowProgress}
              selectedLevel={selectedLevel}
              onSelectLevel={handleSelectLevel} 
            />
          </motion.div>
        )}
        {/* --- END OF UPDATE --- */}

        {currentScreen === "PROGRESS" && (
          <motion.div key="progress" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} style={{ width: '100%', position: 'absolute' }}>
            <ProgressScreen 
              token={token}
              onGoToMenu={handleGoToMenu} 
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

export default App;
