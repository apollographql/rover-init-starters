import { SchemaValidator } from '../SchemaValidator';
import { gql } from '../../../__tests__/helpers/gqlForTesting';
import { buildASTSchema, parse, printSchema } from 'graphql';
import { ZodError, ZodIssueCode } from 'zod';

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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
        data: {
          bookTitle: 'The Martian',
        },
      }),
    ).toEqual({
      data: {
        data: {
          bookTitle: 'The Martian',
        },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
        data: {
          book: {
            __typename: 'Book',
            title: 'The Martian',
          },
        },
      }),
    ).toEqual({
      data: {
        data: {
          book: {
            __typename: 'Book',
            title: 'The Martian',
          },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
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
      }),
    ).toEqual({
      data: {
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
        data: {
          book: {
            __typename: 'Hat',
          },
        },
      }),
    ).toEqual({
      data: {
        data: {
          book: {
            __typename: 'Book',
          },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
        data: {
          bookTitle: null,
        },
      }),
    ).toEqual({
      data: {
        data: {
          bookTitle: null,
        },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    const result = operationValidator.safeParse({
      data: {
        bookTitle: null,
      },
    });
    expect(result.success).toBe(false);
    expect(result.error).toEqual(
      new ZodError([
        {
          code: ZodIssueCode.invalid_type,
          expected: 'string',
          received: 'null',
          path: ['data', 'bookTitle'],
          message: 'Expected string, received null',
        },
      ]),
    );
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
        data: {
          bookTitles: null,
        },
      }),
    ).toEqual({
      data: {
        data: {
          bookTitles: null,
        },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
        data: {
          bookTitles: ['The Martian', null],
        },
      }),
    ).toEqual({
      data: {
        data: {
          bookTitles: ['The Martian', null],
        },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    const result = operationValidator.safeParse({
      data: {
        bookTitles: ['The Martian', null],
      },
    });
    expect(result.success).toBe(false);
    expect(result.error).toEqual(
      new ZodError([
        {
          code: ZodIssueCode.invalid_type,
          expected: 'string',
          received: 'null',
          path: ['data', 'bookTitles', 1],
          message: 'Expected string, received null',
        },
      ]),
    );
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
        data: {
          bookTitles: null,
        },
      }),
    ).toEqual({
      error: expect.any(Object),
      success: false,
    });
    expect(
      operationValidator.safeParse({
        data: {
          bookTitles: ['The Martian'],
        },
      }),
    ).toEqual({
      data: {
        data: {
          bookTitles: ['The Martian'],
        },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
        data: {
          bookGenre: 'FICTION',
        },
      }),
    ).toEqual({
      data: {
        data: {
          bookGenre: 'FICTION',
        },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
        data: {
          publication: {
            __typename: 'Magazine',
          },
        },
      }),
    ).toEqual({
      data: {
        data: {
          publication: {
            __typename: 'Magazine',
          },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );

    expect(
      operationValidator.safeParse({
        data: {
          publication: {
            __typename: 'Magazine',
            title: 'Game Informer',
          },
        },
      }),
    ).toEqual({
      data: {
        data: {
          publication: {
            __typename: 'Magazine',
            title: 'Game Informer',
          },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );

    expect(
      operationValidator.safeParse({
        data: {
          publication: {
            __typename: 'Publication',
            title: 'Game Informer',
          },
        },
      }),
    ).toEqual({
      data: {
        data: {
          publication: {
            __typename: 'Publication',
            title: 'Game Informer',
          },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );

    expect(
      operationValidator.safeParse({
        data: {
          publication: {
            __typename: 'Book',
            title: 'The Martian',
            edition: 'First Edition',
          },
        },
      }),
    ).toEqual({
      data: {
        data: {
          publication: {
            __typename: 'Book',
            title: 'The Martian',
            edition: 'First Edition',
          },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );

    expect(
      operationValidator.safeParse({
        data: {
          publication: {
            __typename: 'Magazine',
            title: 'Game Informer',
            publicationMonth: 'June',
          },
        },
      }),
    ).toEqual({
      data: {
        data: {
          publication: {
            __typename: 'Magazine',
            title: 'Game Informer',
            publicationMonth: 'June',
          },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );

    expect(
      operationValidator.safeParse({
        data: {
          printedMedia: {
            __typename: 'Publication',
            title: 'Game Informer',
          },
        },
      }),
    ).toEqual({
      data: {
        data: {
          printedMedia: {
            __typename: 'Publication',
            title: 'Game Informer',
          },
        },
      },
      success: true,
    });
  });

  it('handles named fragments for an interface', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        book: Book
        bookExists: Boolean!
      }

      interface Book {
        title: String!
      }
    `);

    const operation = gql`
      query Get_Book {
        book {
          ...BookDetailsFragment
        }
      }

      fragment BookDetailsFragment on Book {
        title
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );

    const result = operationValidator.safeParse({
      data: {
        book: {
          title: 'The Martian',
        },
      },
    });

    expect(result).toEqual({
      data: {
        data: {
          book: {
            title: 'The Martian',
          },
        },
      },
      success: true,
    });
  });

  it('handles named fragments for an object type', () => {
    const schema = makeSubgraphSchema(gql`
      type Query {
        book: Book
        bookExists: Boolean!
      }

      type Book {
        title: String!
      }
    `);

    const operation = gql`
      query Get_Book {
        book {
          ...BookDetailsFragment
        }
      }

      fragment BookDetailsFragment on Book {
        title
      }
    `;
    const subgraphValidator = new SchemaValidator(schema);
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );

    const result = operationValidator.safeParse({
      data: {
        book: {
          title: 'The Martian',
        },
      },
    });

    expect(result).toEqual({
      data: {
        data: {
          book: {
            title: 'The Martian',
          },
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
    const operationValidator = subgraphValidator.getOperationValidator(
      parse(operation),
    );
    expect(
      operationValidator.safeParse({
        data: {
          updateBookTitle: 'The Martian',
        },
      }),
    ).toEqual({
      data: {
        data: {
          updateBookTitle: 'The Martian',
        },
      },
      success: true,
    });
  });
});
