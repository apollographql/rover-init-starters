import { gql } from '@apollo/client';

// Simple GraphQL queries for the AI MockProvider
// The AI MockProvider will generate mock data dynamically based on these queries

export interface Location {
  id: string;
  name: string;
  description: string;
  photo?: string;
}

export interface LocationsData {
  locations: Location[];
}

export interface LocationData {
  location: Location;
}

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