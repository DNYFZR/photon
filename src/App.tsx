// User Interface - Main Entry Point
import "./App.css";
import noteIcon from "/icons/notes-128.png";

// Tauri
import { invoke } from "@tauri-apps/api/core";

// React 
import ReactDOM from "react-dom/client";
import React, { useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import rehypePrism from "rehype-prism-plus";
import Sidebar from "./components/Sidebar";

function App() {
  // App controls
  const [formAction, setFormAction] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(15);

  // Content controls
  const [cwd, setCwd] = useState<string>("");
  const [currentDir, setCurrentDir] = useState<string>("");
    
  const [activePath, setActivePath] = useState<string>("");
  const [activeContent, setActiveContent] = useState<string[]>([]);
  const [activeContentString, setActiveContentString] = useState<string>("");
  const [contentType, setContentType] = useState<string>("");
  
  const [saveResult, setSaveResult] = useState<string[]>([]);
  const [savePath, setSavePath] = useState<string>("");
  
  function toString(parts:string[]): string {
    return `${parts[0]}\n`.concat(...parts.slice(1).map((v) => `${v}\n`));
  }

  async function getCWD() {
    setCwd(await invoke("get_cwd"));
  }
  
  async function setCWD(path:string) {
    await invoke("set_cwd", {path: path});
  }

  async function scanPath(path:string) {
    setActivePath(path);

    const requestedContent:string[] = await invoke("scan_path", { path: path });
    setActiveContent(requestedContent);
    setActiveContentString(requestedContent.length > 0 ? toString(requestedContent) : "")
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
      } else {
        setActivePath("");
        setActiveContent([]);
        setActiveContentString("");
      }
    } 
    
    else if(formAction === "SAVE"){
      if (savePath && activeContentString.length > 0){
        saveToFile("create", savePath, activeContentString);
        setSavePath("");
      } else {
        setSaveResult(["Save-as error : please enter a valid filepath", ]);
      }
      
    } 
    
    else if(formAction === "OVERWRITE"){
      if(activePath && activeContentString.length > 0){
        saveToFile("overwrite", activePath, activeContentString);
        setSavePath("");
      } else {
        setSaveResult(["Save error : could not overwrite existing file", ]);
      }

    } 
  }

  async function handleCodeUI(text:string) {
    setActiveContentString(text);
    setActiveContent(text.split("\n"));
  }
  
  return (
    <main className="container" onLoad={() => {
      setCWD("%USERPROFILE%/Documents")
      getCWD();
      }}>
      <h3 className="app-header">Photon</h3>

      <Sidebar>
        {/* Filesystem Navigation */}
        <form className="row" onSubmit={(e) => handleFormSubmit(e)}>  
          <button type="submit" onClick={() => setFormAction("setDir")}>Set</button>
          <input 
            placeholder="Set directory..."
            value={currentDir}
            onChange={(e) => setCurrentDir(e.target.value)}
          />
        </form> 

        <form className="col" onSubmit={(e) => handleFormSubmit(e)}>
          <div className="row">
      
            {/* Load / Save File */}
            <div className="col">
              <button type="submit" onClick={() => setFormAction("OK")}>Load</button>
              <button type="submit" onClick={() => setFormAction("OVERWRITE")}>Save</button>
            </div>  

            <input
              placeholder="Source path..."
              value={activePath}
              onChange={(e) => {
                setActivePath(e.target.value);
                setActiveContent([]);
                setActiveContentString("");
              }}
            />
          </div>
          
          {/* Save-as File */}
          <div className="row">
            <button type="submit" onClick={() => setFormAction("SAVE")}>Save As</button>
            <input
              placeholder="Output path..."
              value={savePath}
              onChange={(e) => setSavePath(e.target.value)}
            />                
          </div>
        </form> 

        {/* UI Display Controls */}
        <div className="row">
          <button>Font Size</button>
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
          <button>Code Format</button>
          <input
            className="input"
            placeholder="Format..."
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          />
        </div>

        <pre className="highlight-text">{saveResult.length > 0 ? saveResult : null}</pre>
      </Sidebar>
      
      {/* Editor UI */}  
      <div className="app-code-editor">
        
        <p className="app-active-filename">
          {activePath !== "." && activeContent.length > 0 && activePath.split(".").length > 1 ? 
            activePath.split("/").slice(-1) 
            : null
          }
        </p>
        
        <CodeEditor
          value={activeContentString}
          language={contentType}
          placeholder="Enter code here..."
          onChange={(e) => handleCodeUI(e.target.value)}
          rehypePlugins={[
            [rehypePrism, { ignoreMissing: true, showLineNumbers: true }],
          ]}
          className="app-file-render"
          style={{fontSize: fontSize}}
        />
      </div>

      {/* Bottom Info Bar */}
      <div className="app-bottom-bar">
        <img src={noteIcon} className="app-bottom-bar-icon" />
        <pre className="highlight-text"><b>{cwd.replace(/\\/g, "/")}</b></pre>
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
