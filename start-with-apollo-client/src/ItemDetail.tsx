import { useQuery } from '@apollo/client';
import { useParams, Link, useLocation } from 'react-router-dom';
import { GET_ITEM_BY_ID, type ItemData, type Item } from './apollo/queries/example';

export function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const passedItem = location.state?.item as Item;
  
  const { loading, error, data } = useQuery<ItemData>(GET_ITEM_BY_ID, {
    variables: { id },
    skip: !!passedItem, // Skip query if we have the data from navigation
    context: {
        prompt: "Location descriptions should be 10 words or less. The Fourth location should sound terrible.",
    }
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading item details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <p>Error loading item</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error.message}</p>
        <Link to="/" className="back-link">← Back</Link>
      </div>
    );
  }

  // Use passed item data if available, otherwise use queried data
  const itemData = passedItem || data?.item;

  if (!itemData) {
    return (
      <div className="error-state">
        <div className="error-icon">❌</div>
        <p>Item not found</p>
        <Link to="/" className="back-link">← Back</Link>
      </div>
    );
  }

  const { name, description, photo } = itemData;

  return (
    <div className="item-detail">
      <Link to="/" className="back-link">← Back</Link>
      
      <div className="item-detail-card">
        <h1 className="item-detail-title">
          <span style={{ fontSize: '1.5rem' }}>📍</span>
          {name}
        </h1>
        
        <img 
          className="item-detail-image" 
          alt={`${name} item`} 
          src={photo} 
        />
        
        <div className="item-detail-content">
          <h2>About this item</h2>
          <p className="item-detail-description">{description}</p>
        </div>
      </div>
    </div>
  );
}