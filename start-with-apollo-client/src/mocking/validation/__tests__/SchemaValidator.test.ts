import { SchemaValidator } from '../SchemaValidator';
import { gql } from '../../../__tests__/helpers/gqlForTesting';
import { buildASTSchema, parse, printSchema } from 'graphql';

function makeSubgraphSchema(schema: string): string {
  return printSchema(buildASTSchema(parse(schema)));
}

describe('SchemaValidator', () => {
  it('validates a query for a simple scalar', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        bookTitle: String
      }
    `);
    const operation = gql`
      query Get_Book {
        bookTitle
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        bookTitle: 'The Martian',
      }),
    ).toEqual({
      data: {
        bookTitle: 'The Martian',
      },
      success: true,
    });
  });

  it('validates a query for a nested object', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        book: Book
      }

      type Book {
        title: String
      }
    `);
    const operation = gql`
      query Get_Book {
        book {
          __typename
          title
        }
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        book: {
          __typename: 'Book',
          title: 'The Martian',
        },
      }),
    ).toEqual({
      data: {
        book: {
          __typename: 'Book',
          title: 'The Martian',
        },
      },
      success: true,
    });
  });

  it('validates a query for deeply nested objects with multiple fields', () => {
    const schema = makeSubgraphSchema(gql`
      scalar DateTime

      type Query {
        book: Book
      }

      type Book {
        title: String!
        author: Author!
        publicationDate: DateTime
      }

      type Author {
        name: String!
        address: Address
        age: Int
      }

      type Address {
        postalCode: Int!
      }
    `);
    const operation = gql`
      query Get_Book {
        book {
          __typename
          title
          publicationDate
          author {
            __typename
            name
            address {
              __typename
              postalCode
            }
          }
        }
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        book: {
          __typename: 'Book',
          title: 'The Martian',
          publicationDate: '2024-12-01T00:00:00Z',
          author: {
            __typename: 'Author',
            name: '',
            address: {
              __typename: 'Address',
              postalCode: 33215,
            },
          },
        },
      }),
    ).toEqual({
      data: {
        book: {
          __typename: 'Book',
          title: 'The Martian',
          publicationDate: '2024-12-01T00:00:00Z',
          author: {
            __typename: 'Author',
            name: '',
            address: {
              __typename: 'Address',
              postalCode: 33215,
            },
          },
        },
      },
      success: true,
    });
  });

  it('coerces object type names to ensure correctness', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        book: Book
      }

      type Book {
        title: String
      }
    `);
    const operation = gql`
      query Get_Book {
        book {
          __typename
        }
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        book: {
          __typename: 'Hat',
        },
      }),
    ).toEqual({
      data: {
        book: {
          __typename: 'Book',
        },
      },
      success: true,
    });
  });

  it('handles nullable values', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        bookTitle: String
      }
    `);
    const operation = gql`
      query Get_Book {
        bookTitle
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        bookTitle: null,
      }),
    ).toEqual({
      data: {
        bookTitle: null,
      },
      success: true,
    });
  });

  it('handles non-nullable values', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        bookTitle: String!
      }
    `);
    const operation = gql`
      query Get_Book {
        bookTitle
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        bookTitle: null,
      }),
    ).toEqual({
      data: {
        bookTitle: 'null',
      },
      success: true,
    });
  });

  it('handles nullable lists', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        bookTitles: [String]
      }
    `);
    const operation = gql`
      query Get_Books {
        bookTitles
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        bookTitles: null,
      }),
    ).toEqual({
      data: {
        bookTitles: null,
      },
      success: true,
    });
  });

  it('handles nullable list members', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        bookTitles: [String]
      }
    `);
    const operation = gql`
      query Get_Books {
        bookTitles
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        bookTitles: ['The Martian', null],
      }),
    ).toEqual({
      data: {
        bookTitles: ['The Martian', null],
      },
      success: true,
    });
  });

  it('handles non-nullable list members', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        bookTitles: [String!]
      }
    `);
    const operation = gql`
      query Get_Books {
        bookTitles
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        bookTitles: ['The Martian', null],
      }),
    ).toEqual({
      data: {
        bookTitles: ['The Martian', 'null'],
      },
      success: true,
    });
  });

  it('handles non-nullable lists', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        bookTitles: [String!]!
      }
    `);
    const operation = gql`
      query Get_Books {
        bookTitles
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        bookTitles: null,
      }),
    ).toEqual({
      error: expect.any(Object),
      success: false,
    });
    expect(
      operationValidator.safeParse({
        bookTitles: ['The Martian'],
      }),
    ).toEqual({
      data: {
        bookTitles: ['The Martian'],
      },
      success: true,
    });
  });

  it('handles fields that return an enum', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        bookGenre: Genre
      }

      enum Genre {
        FICTION
        NON_FICTION
      }
    `);
    const operation = gql`
      query Get_Book_Genre {
        bookGenre
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        bookGenre: 'FICTION',
      }),
    ).toEqual({
      data: {
        bookGenre: 'FICTION',
      },
      success: true,
    });
  });

  it('handles unions with no fragments', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        publication: Publication
      }

      union Publication = Book | Magazine

      type Book {
        title: String!
      }

      type Magazine {
        title: String!
      }
    `);
    const operation = gql`
      query Get_Publication {
        publication {
          __typename
        }
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        publication: {
          __typename: 'Magazine',
        },
      }),
    ).toEqual({
      data: {
        publication: {
          __typename: 'Magazine',
        },
      },
      success: true,
    });
  });

  it('handles unions with fragments', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        publication: Publication
      }

      union Publication = Book | Magazine

      type Book {
        title: String!
      }

      type Magazine {
        title: String!
      }
    `);
    const operation = gql`
      query Get_Publication {
        publication {
          __typename
          ... on Book {
            title
          }
          ... on Magazine {
            title
          }
        }
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);

    expect(
      operationValidator.safeParse({
        publication: {
          __typename: 'Magazine',
          title: 'Game Informer',
        },
      }),
    ).toEqual({
      data: {
        publication: {
          __typename: 'Magazine',
          title: 'Game Informer',
        },
      },
      success: true,
    });
  });

  it('handles interfaces without fragments', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        publication: Publication
      }

      interface Publication {
        title: String!
      }

      type Book implements Publication {
        title: String!
      }

      type Magazine implements Publication {
        title: String!
      }
    `);
    const operation = gql`
      query Get_Publication {
        publication {
          __typename
          title
        }
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);

    expect(
      operationValidator.safeParse({
        publication: {
          __typename: 'Publication',
          title: 'Game Informer',
        },
      }),
    ).toEqual({
      data: {
        publication: {
          __typename: 'Publication',
          title: 'Game Informer',
        },
      },
      success: true,
    });
  });

  it('handles interfaces with fragments', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        publication: Publication
      }

      interface Publication {
        title: String!
      }

      type Book implements Publication {
        title: String!
        edition: String!
      }

      type Magazine implements Publication {
        title: String!
        publicationMonth: String!
      }
    `);
    const operation = gql`
      query Get_Publication {
        publication {
          ... on Book {
            title
            edition
          }
          ... on Magazine {
            title
            publicationMonth
          }
        }
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);

    expect(
      operationValidator.safeParse({
        publication: {
          __typename: 'Book',
          title: 'The Martian',
          edition: 'First Edition',
        },
      }),
    ).toEqual({
      data: {
        publication: {
          __typename: 'Book',
          title: 'The Martian',
          edition: 'First Edition',
        },
      },
      success: true,
    });
  });

  it('handles interfaces with both interface fields and fragment fields', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        publication: Publication
      }

      interface Publication {
        title: String!
      }

      type Book implements Publication {
        title: String!
        edition: String!
      }

      type Magazine implements Publication {
        title: String!
        publicationMonth: String!
      }
    `);
    const operation = gql`
      query Get_Publication {
        publication {
          title

          ... on Book {
            edition
          }
          ... on Magazine {
            publicationMonth
          }
        }
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);

    expect(
      operationValidator.safeParse({
        publication: {
          __typename: 'Magazine',
          title: 'Game Informer',
          publicationMonth: 'June',
        },
      }),
    ).toEqual({
      data: {
        publication: {
          __typename: 'Magazine',
          title: 'Game Informer',
          publicationMonth: 'June',
        },
      },
      success: true,
    });
  });

  it('handles unions with interfaces', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        printedMedia: PrintedMedia
      }

      union PrintedMedia = Book | Magazine

      interface Publication {
        title: String!
      }

      type Book implements Publication {
        title: String!
        edition: String!
      }

      type Magazine implements Publication {
        title: String!
        publicationMonth: String!
      }
    `);
    const operation = gql`
      query Get_Publication {
        printedMedia {
          __typename
          ... on Publication {
            __typename
            title
          }
        }
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);

    expect(
      operationValidator.safeParse({
        printedMedia: {
          __typename: 'Publication',
          title: 'Game Informer',
        },
      }),
    ).toEqual({
      data: {
        printedMedia: {
          __typename: 'Publication',
          title: 'Game Informer',
        },
      },
      success: true,
    });
  });

  it('validates a mutation for a simple scalar', () => {
    const schema = makeSubgraphSchema(gql`
      type Mutation {
        updateBookTitle(bookId: Int!, title: String!): String
      }
    `);
    const operation = gql`
      mutation Update_Book($bookId: Int!, $title: String!) {
        updateBookTitle(bookId: $bookId, title: $title)
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator =
      subgraphValidator.getOperationValidator(operation);
    expect(
      operationValidator.safeParse({
        updateBookTitle: 'The Martian',
      }),
    ).toEqual({
      data: {
        updateBookTitle: 'The Martian',
      },
      success: true,
    });
  });
});
