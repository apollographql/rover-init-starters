import { useQuery } from '@apollo/client';
import { graphql } from './gql';
import './App.css';

// Define the GraphQL query using the client-preset graphql() function
// This will generate types automatically based on your schema
const GET_LOCATIONS = graphql(/* GraphQL */ `
  query GetLocations {
    locations {
      id
      name
      description
      photo
    }
  }
`);

function DisplayLocations() {
  // Use the standard useQuery hook with the typed query
  const { loading, error, data } = useQuery(GET_LOCATIONS);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Fetching data with Apollo Client...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>GraphQL query failed</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error.message}</p>
      </div>
    );
  }

  // data.locations is now fully typed thanks to client-preset!
  return (
    <div className="locations-grid">
      {data?.locations?.map(({ id, name, description, photo }) => (
        <div key={id} className="location-card">
          <img 
            className="location-image" 
            alt={`${name} location`} 
            src={photo} 
          />
          <div className="location-badge">GraphQL Query Result</div>
          <h3 className="location-title">
            <span style={{ fontSize: '1.2rem' }}>📍</span>
            {name}
          </h3>
          <p className="location-description">{description}</p>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  return (
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
        <DisplayLocations />
      </div>
    </div>
  );
}