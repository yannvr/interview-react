import React, { Component } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Country from "./components/country";

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">Alphakinetic Country Dropdown</header>
        <Country />
      </div>
    );
  }
}

export default App;
