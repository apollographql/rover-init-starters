import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_LOCATIONS, type LocationsData } from './apollo/queries/example';

export function Locations() {
  const { loading, error, data } = useQuery<LocationsData>(GET_LOCATIONS);

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
          
          <div className="location-actions">
            <Link 
              to={`/location/${id}`} 
              state={{ location: { id, name, description, photo } }}
              className="location-link"
            >
              View location details →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}