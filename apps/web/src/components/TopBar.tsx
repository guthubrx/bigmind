/**
 * FR: Barre supérieure de BigMind
 * EN: BigMind top bar
 */

import React from 'react';
import './TopBar.css';

const TopBar: React.FC = () => {
  return (
    <div className="top-bar">
      {/* FR: Section gauche - Logo uniquement */}
      {/* EN: Left section - Logo only */}
      <div className="top-bar-left">
        <div className="logo">
          <img src="/logo.svg" alt="BigMind" className="logo-icon" />
          <span className="app-name">BigMind</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
