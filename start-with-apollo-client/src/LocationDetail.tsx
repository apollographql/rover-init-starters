import { useQuery } from '@apollo/client';
import { useParams, Link, useLocation } from 'react-router-dom';
import { GET_LOCATION_BY_ID, type LocationData, type Location } from './apollo/queries';

export function LocationDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const passedLocation = location.state?.location as Location;
  
  const { loading, error, data } = useQuery<LocationData>(GET_LOCATION_BY_ID, {
    variables: { id },
    skip: !!passedLocation, // Skip query if we have the data from navigation
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading location details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>Error loading location</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error.message}</p>
        <Link to="/" className="back-link">← Back to all locations</Link>
      </div>
    );
  }

  // Use passed location data if available, otherwise use queried data
  const locationData = passedLocation || data?.location;

  if (!locationData) {
    return (
      <div className="error-state">
        <div className="error-icon">❌</div>
        <p>Location not found</p>
        <Link to="/" className="back-link">← Back to all locations</Link>
      </div>
    );
  }

  const { name, description, photo } = locationData;

  return (
    <div className="location-detail">
      <Link to="/" className="back-link">← Back to all locations</Link>
      
      <div className="location-detail-card">
        <h1 className="location-detail-title">
          <span style={{ fontSize: '1.5rem' }}>📍</span>
          {name}
        </h1>
        
        <img 
          className="location-detail-image" 
          alt={`${name} location`} 
          src={photo} 
        />
        
        <div className="location-detail-content">
          <h2>About this location</h2>
          <p className="location-detail-description">{description}</p>
        </div>
      </div>
    </div>
  );
}