import "./Popup.css";
import React, { useState } from "react";

interface PopupProps {
  title:string
  icon: string;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ title, icon, children }) => {
  const [showPopup, setShowPopup] = useState<boolean>(false);  

  return(
    <div>
      <button onClick={() => setShowPopup(!showPopup)}>
        <img src={icon} className="popup-toggle-icon" />
      </button>
      
      {showPopup && (
        <div className="popup-container">
          <div className="popup-top-bar">
            <span>{title}</span>
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