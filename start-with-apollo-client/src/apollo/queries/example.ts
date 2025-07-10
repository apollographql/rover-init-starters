import { gql } from '@apollo/client';

// Simple GraphQL queries for the AI MockProvider
// The AI MockProvider will generate mock data dynamically based on these queries

export interface Item {
  id: string;
  name: string;
  headline?: string;
  subheading?: string;
  description: string;
  photo?: string;
}

export interface ItemsData {
  items: Item[];
}

export interface ItemData {
  item: Item;
}

export const GET_ITEMS = gql`
  query GetItems {
    items {
      id
      name
      headline
      subheading
      description
      photo
    }
  }
`;

export const GET_ITEM_BY_ID = gql`
  query GetItemById($id: ID!) {
    item(id: $id) {
      id
      name
      headline
      subheading
      description
      photo
    }
  }
`;