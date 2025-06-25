// Text Editor UI
import "./Editor.css";
import React from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import rehypePrism from "rehype-prism-plus";

interface EditorPropos {
    filename:string;
    fileContent:string;
    fontSize: number;
    contentType:string;
    onUserUpdate: React.ChangeEventHandler<HTMLTextAreaElement>;
}

const Editor:React.FC<EditorPropos> = ({filename, fileContent, fontSize, contentType, onUserUpdate}) => {
  return (
    <div className="app-code-editor">    
        <p className="app-active-filename">{filename}</p>
        
        <CodeEditor
            value={fileContent}
            language={contentType}
            placeholder="Enter code here..."
            onChange={onUserUpdate}
            rehypePlugins={[
            [rehypePrism, { ignoreMissing: true, showLineNumbers: true }],
            ]}
            className="app-file-render"
            style={{fontSize: fontSize}}
        />
    </div>
  );
}

export default Editor;