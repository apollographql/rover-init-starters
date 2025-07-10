import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Locations } from './Locations';
import { LocationDetail } from './LocationDetail';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <div className="container">
          <header className="header">
            <h1>
              Apollo GraphQL Explorer
              <span className="rocket-icon">🚀</span>
            </h1>
            <p className="subtitle">
              Discover beautiful locations powered by <span className="apollo-brand">GraphQL</span> and <span className="apollo-brand">Apollo Client</span>. 
              Experience the power of modern API development with type-safe queries and real-time data.
            </p>
          </header>
          
          <Routes>
            <Route path="/" element={<Locations />} />
            <Route path="/location/:id" element={<LocationDetail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}