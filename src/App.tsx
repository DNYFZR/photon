// User Interface - Main Entry Point
import "./App.css";
import noteIcon from "/icons/notes-128.png";
import arrowIcon from "/icons/arrow-128.png";

// Tauri
import { invoke } from "@tauri-apps/api/core";

// React 
import ReactDOM from "react-dom/client";
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Popup from "./components/Popup";
import Editor from "./components/Editor";

const ENTRY_POINT: string = "%USERPROFILE%/Documents";

function App() {
  // App controls
  const [formAction, setFormAction] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(16);

  // Directory controls
  const [cwd, setCwd] = useState<string>(ENTRY_POINT);
  const [currentDir, setCurrentDir] = useState<string>("");
  const [cwdListing, setCwdListing] = useState<string[]>([]);

  // File controls
  const [activePath, setActivePath] = useState<string>("");
  const [activeContent, setActiveContent] = useState<string>("");
  
  // Editor controls
  const [contentType, setContentType] = useState<string>("");
  const [saveResult, setSaveResult] = useState<string[]>([]);
  const [savePath, setSavePath] = useState<string>("");

  async function getCWD() {
    setCwd(await invoke("get_cwd"));
  }
  
  async function setCWD(path:string) {
    await invoke("set_cwd", {path: path});
  }

  async function scanFS(path:string) {
    const requestedContent:string[] = await invoke("scan_fs", { path: path });
    if(requestedContent[0] !== "error") {
      setCwdListing(requestedContent);
    } else {
      setCwdListing([]);
    }
  }

  async function scanPath(path:string) {
    setActivePath(path);
    const requestedContent:string[] = await invoke("scan_path", { path: path });
    
    if (requestedContent.length > 0) {
      const content_as_string = `${requestedContent[0]}\n`.concat(...requestedContent.slice(1).map((v) => `${v}\n`)); 
      setActiveContent(content_as_string);
      setContentType(path.split(".").reverse()[0]);
    } else {
      setActiveContent("");
    }
  }

  async function saveToFile(method:string, path:string, data:string) {
    if(method === "create"){
      setSaveResult(await invoke("save_file_as", {path: path, data: data}));
    }

    if(method === "overwrite"){
      setSaveResult(await invoke("save_file", {path: path, data: data}));
    }

  }

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(formAction === "setDir" && currentDir.length > 0){
      setCWD(currentDir);
      setCurrentDir("");
      getCWD();
    }

    else if(formAction === "OK"){
      setSaveResult([]);
      
      if (activePath){
        scanPath(activePath);
        scanFS(activePath);


      } else {
        setActivePath("");
        setContentType("");
        setActiveContent("");
      }
    } 
    
    else if(formAction === "SAVE"){
      if (savePath && activeContent.length > 0){
        saveToFile("create", savePath, activeContent);
        setSavePath("");
      } else {
        setSaveResult(["Save-as error : please enter a valid filepath", ]);
      }
      
    } 
    
    else if(formAction === "OVERWRITE"){
      if(activePath && activeContent.length > 0){
        saveToFile("overwrite", activePath, activeContent);
        setSavePath("");
      } else {
        setSaveResult(["Save error : could not overwrite existing file", ]);
      }

    } 
  }

  async function handleCwdUpdate(path:string) {
    setCWD(path);
    scanFS(path);
    setCurrentDir("");
    getCWD();
  }

  return (
    <main className="container" onLoad={() => { 
      setCWD(cwd); 
      getCWD();
      scanFS(cwd);
    }}>
      <h3 className="app-header">Photon Editor</h3>
      
      <Sidebar>
        <div className="row-header">
          <h4>File Explorer</h4>
          <button
            onClick={() => {
              const newCWD = `${cwd}/../`;
              handleCwdUpdate(newCWD);
              }
            }>
              <img src={arrowIcon} title="Back" alt="go back" className="fs-back-icon" />
            </button>
          
        </div>
        
        <div>
          {cwdListing.map((v) => {
            const newCWD = `${cwd}/${v}`;  
            const v_split = v.split(".");  
            
            if(v_split[0] !== "" && v_split.length > 1) {
              return <button className="fs-entry" onClick={() => {
                setActivePath(newCWD);
                setContentType(v.split(".").reverse()[0]);
                
                setActiveContent("");
                setSaveResult([]);

                scanPath(newCWD);
              }}>• {v}</button>

            } else {
              return <button className="fs-entry" onClick={() => handleCwdUpdate(newCWD)}>
                • {v}
              </button>
            }
          }
          )}
        </div>
      </Sidebar>

      <Popup name="App Controls">
        <div className="col">

          {/* Filesystem Navigation */}
          <div className="row">
            <label>Set CWD : </label>
            <form onSubmit={(e) => handleFormSubmit(e)}>  
              <div className="row">
                <input 
                  placeholder="set working directory..."
                  value={currentDir}
                  onChange={(e) => {
                    setCurrentDir(e.target.value);
                    scanFS(e.target.value);
                    setFormAction("setDir");
                  }}
                />
              </div>
            </form>
          </div>

          <div className="row">
            <label>Save file : </label>
            <form onSubmit={(e) => handleFormSubmit(e)}>    
              <div className="row">
                <input
                  placeholder="filepath (save-as only)..."
                  value={savePath}
                  onChange={(e) => setSavePath(e.target.value)}
                />
                <button type="submit" onClick={() => {
                  if(savePath.length > 0) {
                    setFormAction("SAVE");
                  } else {
                    setFormAction("OVERWRITE");
                  }
                }}>OK</button>
              </div>
            
              <pre className="highlight-text">{saveResult.length > 0 ? saveResult : null}</pre>
            </form> 
          </div>
          
          <div className="row">
            <label>Font size : </label>
            <input 
              type="number"
              min={10}
              step={1}
              max={40}
              value={fontSize} 
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>

          <div className="row">
            <label>Syntax highlights : </label>
            <input
              className="input"
              placeholder="filetype e.g. toml..."
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            />
          </div>

        </div>
      </Popup>

      <Editor
        filename={
          activePath !== "." && activeContent.length > 0 && activePath.split(".").length > 1 ? 
            activePath.split("/")[-1] : ""
          }
        fileContent={activeContent}
        onUserUpdate={(e) => setActiveContent(e.target.value)}
        fontSize={fontSize}
        contentType={contentType}
      />
      
      <div className="app-bottom-bar">
        <div className="row">
          <img src={noteIcon} className="app-bottom-bar-icon" />
          <pre className="highlight-text">{cwd.replace(/\\/g, "/")}</pre>
        </div>
        
        <pre className="highlight-text">syntax highlighting : {contentType == "" ? "not set" : contentType}</pre>
        <pre className="highlight-text">editor font size : {fontSize}</pre>
      </div>

    </main>
  );
}

// Run App
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
