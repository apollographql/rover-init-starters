import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Items } from './Items';
import { ItemDetail } from './ItemDetail';
import { GET_ITEMS, type ItemsData } from './apollo/queries/example';
import './App.css';

export default function App() {
  const { data } = useQuery<ItemsData>(GET_ITEMS);
  
  // Use the first item's headline and subheading for the header
  const headerData = data?.items?.[0];
  const headline = headerData?.headline || "Apollo GraphQL Explorer";
  // 🎭 Uncomment this line to see AI MockProvider dynamically generate subheading data!
  // const subheading = headerData?.subheading || "Explore the power of GraphQL with AI-generated data";
  
  return (
    <BrowserRouter>
      <div className="app">
        <div className="apollo-banner">
          <div className="banner-content">
            <span className="banner-icon">🚀</span>
            <span className="banner-text">
              Ready to build a real graph? Visit the{' '}
              <a 
                href="https://www.apollographql.com/docs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="banner-link"
              >
                Apollo GraphQL docs
              </a>
              {' '}to get started
            </span>
          </div>
        </div>
        <div className="container">
          <header className="header">
            <h1>
              {headline}
              <span className="rocket-icon">🚀</span>
            </h1>
            {/* 🎭 Uncomment this block to display AI-generated subheading text!
            <p className="subtitle">
              {subheading}
            </p> */}
            <p className="subtitle">
              Powered by <a 
                href="https://www.apollographql.com/docs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="apollo-brand"
              >
                Apollo GraphQL
              </a>.
            </p>
          </header>
          
          <Routes>
            <Route path="/" element={<Items />} />
            <Route path="/item/:id" element={<ItemDetail />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}