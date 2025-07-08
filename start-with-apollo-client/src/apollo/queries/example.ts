import { graphql } from '../gql';

// These GraphQL operations use the client-preset pattern
// Types are generated automatically when you run `npm run codegen`
// The graphql() function provides full type safety and IntelliSense

export const GET_LOCATIONS = graphql(/* GraphQL */ `
  query GetLocations {
    locations {
      id
      name
      description
      photo
    }
  }
`);

// Example of a query with variables
export const GET_LOCATION_BY_ID = graphql(/* GraphQL */ `
  query GetLocationById($id: ID!) {
    location(id: $id) {
      id
      name
      description
      photo
    }
  }
`);

// Example of a mutation (if supported by your GraphQL endpoint)
export const CREATE_LOCATION = graphql(/* GraphQL */ `
  mutation CreateLocation($input: LocationInput!) {
    createLocation(input: $input) {
      id
      name
      description
      photo
    }
  }
`);