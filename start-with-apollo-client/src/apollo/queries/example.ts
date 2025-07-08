import { gql } from '@apollo/client';

// These GraphQL queries will be used by codegen to generate TypeScript types
// After running `npm run codegen`, you can use the generated hooks:
// import { useGetLocationsQuery, useGetLocationByIdQuery } from '@/generated/graphql';

export const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      id
      name
      description
      photo
    }
  }
`;

// Example of a query with variables
export const GET_LOCATION_BY_ID = gql`
  query GetLocationById($id: ID!) {
    location(id: $id) {
      id
      name
      description
      photo
    }
  }
`;

// Example of a mutation (if supported by your GraphQL endpoint)
export const CREATE_LOCATION = gql`
  mutation CreateLocation($input: LocationInput!) {
    createLocation(input: $input) {
      id
      name
      description
      photo
    }
  }
`;