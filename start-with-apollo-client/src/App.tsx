// Import everything needed to use the `useQuery` hook
import { gql } from '@apollo/client';

// Import generated types and hooks
// These will be available after running `npm run codegen`
import { useGetLocationsQuery } from './generated/graphql';

const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
      description
      photo
    }
  }
`;

function DisplayLocations() {
  // Use the generated typed hook for better type safety
  const { loading, error, data } = useGetLocationsQuery();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  // data.locations is now fully typed!
  return data?.locations?.map(({ id, name, description, photo }) => (
    <div key={id}>
      <h3>{name}</h3>
      <img width="400" height="250" alt="location-reference" src={`${photo}`} />
      <br />
      <b>About this location:</b>
      <p>{description}</p>
      <br />
    </div>
  ));
}

export default function App() {
  return (
    <div>
      <h2>My first Apollo app 🚀</h2>
      <br/>
      <DisplayLocations />
    </div>
  );
}