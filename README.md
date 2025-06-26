<h1 align="center"> photon </h1>

<h4 align="center">🔥 blazingly fast Windows OS text editor app 🔥</h4>

[![test](https://github.com/DNYFZR/rs-photon/actions/workflows/test.yml/badge.svg)](https://github.com/DNYFZR/rs-photon/actions/workflows/test.yml)
[![build](https://github.com/DNYFZR/rs-photon/actions/workflows/build.yml/badge.svg)](https://github.com/DNYFZR/rs-photon/actions/workflows/build.yml)

### Features

When the app is launched, the users' documents directory is set as the current working directory, and using the app menu icon on the right, users can navigate through the filesystem by clicking on items marked with the 📁 icon. 

When a user clicks on a file (marked with 📄 icon) it is loaded into the main editor window, and if supported, the content is rendered with automatic syntax highlighting (currently determined by file extension - see settings section below). 

- Currently, the app only supports text based files, and if a user attempts to open any other type then an unsupported filetype message is displayed in the editor window. 

On the app menu there are three control buttons which trigger a popup window :

- Settings ⚙️ : 
    - users can manually set a new working directory by providing a path relative to the current location.
    - users can change the editor font size
    - override the syntax highlighting (e.g. the current 3rd party package doesn't recognise 'rs' but using the word 'rust' will implement highlighting - this will eventually be dealt with by the app).

- Save 💾 : users can save or save-as, if a filepath is provided the app will attempt to save-as, returning an error message if a file exists at this path. If no filepath is provided, then the app will attempt to overwrite the current path, returning any error messages. When succcessful, both methods will confirm the file has been saved & display the path on the popup window.

- back ⬅️ : allows users to navigate up one level in the working directory. 

At the bottom of the app, there is a bar which displays : 

- The full current working directory path
- The currently implemented syntax highlighting (if applicable)
- The current editor font size 

#### Development

A user database will be created in the user profile directory, under /.photon/app.db : 

- It will be a SQLite database configured as a NoSQL document database, where the key string serves as the primary key, and the values are stored in JSON format. 

- Backend functionality has already been implemented.

There are improvements to be made to the filesystem navigation, with particular focus on :

- Resolving the way files & directories are differentiated between, there are some occasions where paths can be misidentified.

- How the backend handles larger files, currently if a large enough file is requested the backend can slow down the system.

- Implement handling of non-text files.

### Build

In Progress : publish Windows builds to GitHub, allowing the MSI file to be accessed, and the app to be installed without having to install any development tooling on a machine.

#### From Source

If you want to build the app locally from this repo, your system will need to have : 

- Rust (see [Cargo.toml](/src-tauri/Cargo.toml)) 
- Node (see [package.json](/package.json)) 

Then there are a number of options listed in the [Tauri docs](https://v2.tauri.app/distribute/windows-installer/) that can used.
