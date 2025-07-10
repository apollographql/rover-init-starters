import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_ITEMS, type ItemsData } from './apollo/queries/example';

export function Items() {
  const { loading, error, data } = useQuery<ItemsData>(GET_ITEMS);

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
    <div className="items-grid">
      {data?.items?.map(({ id, name, description, photo }) => (
        <div key={id} className="item-card">
          <img 
            className="item-image" 
            alt={`${name} item`} 
            src={photo} 
          />
          <div className="item-badge">GraphQL Query Result</div>
          <h3 className="item-title">
            <span style={{ fontSize: '1.2rem' }}>📍</span>
            {name}
          </h3>
          <p className="item-description">{description}</p>
          
          <div className="item-actions">
            <Link 
              to={`/item/${id}`} 
              state={{ item: { id, name, description, photo } }}
              className="item-link"
            >
              View details →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}