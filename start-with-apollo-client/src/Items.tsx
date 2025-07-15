import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_ITEMS, type ItemsData } from './apollo/queries/example';

export function Items() {
  const { loading, error, data } = useQuery<ItemsData>(GET_ITEMS, {
    context: {
      prompt: "Descriptions from the description field should be 10 words or less. " +
        "The third item in the returned list should sound terrible.",
      // 🎭 Uncomment this prompt and use alternativeSystemPrompt from main.tsx to see AI adapt to eco-tourism data!
      // prompt: "Names should be between 10 and 200 characters. Descriptions should be between 20 and 50 words " +
      //   "with at least one very long description. Sort by expected cost from low to high."
    }
  });

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