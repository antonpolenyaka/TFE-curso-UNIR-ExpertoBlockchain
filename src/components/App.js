import React, { Component } from 'react';
import './App.css';
import { Container } from 'semantic-ui-react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import 'semantic-ui-css/semantic.min.css';
import Header from './Header';
import Tokens from './Tokens';
import Clients from './Clients';
import Firms from './Firms';
import Footer from './Footer';

class App extends Component {

  render() {
    return (
      <BrowserRouter>
        <Container>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Tokens />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/firms" element={<Firms />} />
            </Routes>
          </main>
          <Footer />
          <p>&nbsp;</p>
        </Container>
      </BrowserRouter>
    );
  }

}

export default App;
