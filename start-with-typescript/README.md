# Rover init Start with Typescript template


This template helps create an [Apollo Federation](https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/federation) subgraph with [Apollo Server](https://www.apollographql.com/docs/apollo-server) and the [@apollo/subgraph](https://www.apollographql.com/docs/apollo-server/using-federation/api/apollo-subgraph) package. You can use this template with the [`rover init`](https://www.apollographql.com/docs/rover/commands/init) command by selecting **Start with Typescript** in the command's wizard.

## What's included

- A basic, [Apollo Federation] subgraph with simple examples for queries, entities, and mutations. You can run this subgraph with `npm start`.
- [nodemon] is setup for `npm run dev` for a hot-reloading development environment.
- Example tests in the `src/__tests__` directory. You can run these tests with `npm run test`.
- [GraphQL Code Generator] pre-configured as a `build` step.

## Next steps

- Setup project with `npm install`
  - This will also run the `postinstall` script which will run `codegen` and compile the project
- Download [Rover] and start it using the command printed as part of rover init

[apollo federation]: https://www.apollographql.com/docs/federation/
[@apollo/server]: https://www.apollographql.com/docs/apollo-server/
[@apollo/subgraph]: https://www.apollographql.com/docs/federation/subgraphs
[rover]: https://www.apollographql.com/docs/rover/
[nodemon]: https://www.npmjs.com/package/nodemon
[GraphQL Code Generator]: https://www.the-guild.dev/graphql/codegen
