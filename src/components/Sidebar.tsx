// Resizable sidebar with persistent menu icon

import React, { useState, useRef } from "react";
import "./Sidebar.css";
import menuIcon from "/icons/menu-128.png";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  // States
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(200);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  // Resize controller
  const startResizing = React.useCallback(() => {setIsResizing(true);}, []);
  const stopResizing = React.useCallback(() => {setIsResizing(false);}, []);
  const resize = React.useCallback((mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        setSidebarWidth(
          mouseMoveEvent.clientX -
            sidebarRef.current.getBoundingClientRect().left
        );
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  return (
    <div className="sidebar">
      {/* show / hide toggle */}
      <button className="sidebar-button" onClick={() => setShowSidebar(!showSidebar)}>
        <img src={menuIcon} className="sidebar-button-img" />
      </button>
      
      {/* sidebar */}
      {showSidebar && (
        <div className="sidebar-container">
          <div
            ref={sidebarRef}
            className="sidebar-main"
            style={{ width: sidebarWidth }}
          >
            <div className="sidebar-content">
              {children}
            </div>
            
            <div className="sidebar-resizer" onMouseDown={startResizing} />
          </div>
          <div className="sidebar-frame" />
        </div>
      )}
    </div>
  );
}

export default Sidebar;
