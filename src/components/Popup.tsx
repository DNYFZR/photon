import "./Popup.css";
import settingsIcon from "/icons/settings-128.png";
import React, { useState } from "react";

interface PopupProps {
  name: string;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ name, children }) => {
  const [showPopup, setShowPopup] = useState<boolean>(false);  

  return(
    <div>
      <button className="popup-toggle" onClick={() => setShowPopup(!showPopup)}>
        <img src={settingsIcon} className="popup-toggle-icon" />
      </button>
      
      {showPopup && (
        <div className="popup-container">
          <div className="popup-top-bar">
            <span>{name}</span>
          </div>

          <div className="popup-content">
            {children}
          </div>

          <div className="popup-bottom-bar">
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;