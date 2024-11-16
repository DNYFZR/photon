// User Interface - Main Entry Point

// Tauri API
import { invoke } from "@tauri-apps/api/core";

// React UI
import "./App.css";
import noteIcon from "/icons/notes-128.png";
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import Sidebar from "./components/Sidebar";

// Code UI
import CodeEditor from '@uiw/react-textarea-code-editor';
import rehypePrism from 'rehype-prism-plus';


function App() {
  // App controls
  const [formAction, setFormAction] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(15);

  // Content controls
  const [cwd, setCwd] = useState<string>("");
  const [currentDir, setCurrentDir] = useState<string>("");
    
  const [activePath, setActivePath] = useState<string>("");
  const [_, setActiveContent] = useState<string[]>([]);
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
      await invoke("set_cwd", {path: currentDir});
      setCurrentDir("");
      getCWD();
    }

    if(formAction === "OK"){
      if (activePath){
        scanPath(activePath);
      }
      
      else {
        setActivePath("");
        setActiveContent([]);
        setActiveContentString("");
        setSaveResult([]);
      }
    } else if(formAction === "SAVE" && savePath && activeContentString.length > 0){
      saveToFile("create", savePath, activeContentString);
      setSavePath("");

    } else if(formAction === "OVERWRITE" && savePath && activeContentString.length > 0){
      saveToFile("overwrite", savePath, activeContentString);
      setSavePath("");

    } else if (formAction === "SAVE" && !savePath && activeContentString.length > 0) {
      setSaveResult(["Save error : please enter a valid filepath", ]);
    }
  }

  async function handleCodeUI(text:string) {
    setActiveContentString(text);
    setActiveContent(text.split("\n"));
  }
  
  return (
    <main className="container" onLoad={getCWD}>
      {/* Header */}
      <h2 className="app-header">Photon</h2>
      
      {/* Sidebar */}
      <Sidebar>
        {/* Set CWD */}
        <form className="row" onSubmit={(e) => handleFormSubmit(e)}>  
          <button type="submit" onClick={() => setFormAction("setDir")}>Set</button>
          <input 
            placeholder="Set directory..."
            value={currentDir}
            onChange={(e) => setCurrentDir(e.target.value)}
          />
        </form> 

        {/* Filesystem Scan */}
        <form className="col" onSubmit={(e) => handleFormSubmit(e)}>
          <div className="row">
            {/* User filepath */}
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
          
          {/* User save as location */}
          <div className="row">
            <button type="submit" onClick={() => setFormAction("SAVE")}>Save As</button>
            <input
              placeholder="Output path..."
              value={savePath}
              onChange={(e) => setSavePath(e.target.value)}
            />                
          </div>

          <pre className="highlight-text">{saveResult.length > 0 ? saveResult : null}</pre>
        </form>    
      </Sidebar>
      
      {/* Main user interface */}
      <div className="row">
        <div className="row">
          <pre>Font Size : </pre>
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
          <pre>File format : </pre>
          <input
            className="input-small"
            placeholder="Format..."
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          />
        </div>

      </div>

      
      <div className="app-code-editor">
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

      <div className="app-bottom-bar">
        <img src={noteIcon} className="app-bottom-bar-icon" />
        <pre className="highlight-text"><b>{cwd}\{activePath && activePath !== "."? activePath : null}</b></pre>
      </div>

    </main>
  );
}

// Render App
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
