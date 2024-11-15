// User Interface - Main Entry Point

// Tauri API
import { invoke } from "@tauri-apps/api/core";

// test
import CodeEditor from '@uiw/react-textarea-code-editor';
import rehypePrism from 'rehype-prism-plus';

// React UI
import "./App.css";
import logo from "/wave-128.png";

import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import Sidebar from "./components/Sidebar";

function App() {
  // App controls
  const [formAction, setFormAction] = useState<string>("");
  
  // Content controls
  const [activeDir, setActiveDir] = useState<string>("");
  const [activeDirContent, setActiveDirContent] = useState<string[]>([]);
  
  const [activePath, setActivePath] = useState<string>("");
  const [activeContent, setActiveContent] = useState<string[]>([]);
  const [activeContentString, setActiveContentString] = useState<string>("");
  const [contentType, setContentType] = useState<string>("");
  
  const [saveResult, setSaveResult] = useState<string[]>([]);
  const [savePath, setSavePath] = useState<string>("");
  
  function toString(parts:string[]): string {
    return `${parts[0]}\n`.concat(...parts.slice(1).map((v) => `${v}\n`));
  }

  async function scanPath(path:string) {
    setActivePath(path);

    const requestedContent:string[] = await invoke("scan_path", { path: path });
    setActiveContent(requestedContent);
    setActiveContentString(requestedContent.length > 0 ? toString(requestedContent) : "")
  }

  async function saveAs(path:string, data:string) {
    setSaveResult(await invoke("save_file_as", {path: path, data: data}));
  }

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if(formAction === "OK"){
      if (activePath){
        scanPath(activePath);
      }
      
      else if(activeDir){
        setActiveDirContent(await invoke("scan_path", { path: activeDir }));
      }
      
      else {
        setActivePath("");
        setActiveContent([]);
        setActiveContentString("");
        setSaveResult([]);
      }
    } else if(formAction === "SAVE" && savePath && activeContentString.length > 0){
      saveAs(savePath, activeContentString);
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
    <main className="container">
      {/* Header */}
      <div className="row">
        <img src={logo} className="logo-photon" alt="Photon logo" />
        <h3>Photon</h3>
      </div>

      {/* Sidebar */}
      <Sidebar>
        <form className="row" onSubmit={(e) => handleFormSubmit(e)}>
          <div className="row">
            <input
              placeholder="Attach directory..."
              value={activeDir}
              onChange={(e) => {
                setActiveDir(e.target.value);
              }}
            />
            <button type="submit" onClick={() => setFormAction("OK")}>Load</button>        
          </div>
        </form>
        
        <div className="app-menu-content">
          {activeDirContent.length > 0 && <pre>{toString(activeDirContent)}</pre>}
        </div>
      </Sidebar>
      
      {/* Filesystem */}
      <form className="row" onSubmit={(e) => handleFormSubmit(e)}>
        <div className="row">
          <input
            placeholder="Source path..."
            value={activePath}
            onChange={(e) => {
              setActivePath(e.target.value);
              setActiveContent([]);
              setActiveContentString("");
            }}
          />

          <input
            className="input-small"
            placeholder="Ext."
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          />
          <button type="submit" onClick={() => setFormAction("OK")}>Load</button>        
        </div>

        <div className="row">
          <input
            placeholder="Output path..."
            value={savePath}
            onChange={(e) => setSavePath(e.target.value)}
          />        
          <button type="submit" onClick={() => setFormAction("SAVE")}>Save</button>
        </div>
      </form> 

      <pre>{saveResult.length > 0 && saveResult}</pre>

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
        />
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
