import { useQuery } from '@apollo/client';
import { graphql } from './gql';

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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  // data.locations is now fully typed thanks to client-preset!
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