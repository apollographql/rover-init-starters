# Rover init Start with Typescript template


This template can be used to quickly create an [Apollo Federation] subgraph with the [@apollo/subgraph] and [@apollo/server] packages. You can use this template from [Rover](https://www.apollographql.com/docs/rover/commands/template/) with `rover init` and selecting the "start with Typescript" journey.

## What's Included

- A basic, [Apollo Federation] subgraph with simple examples for queries, entities, and mutations. You can run this subgraph with `npm start`.
- [nodemon] is setup for `npm run dev` for a hot-reloading development environment.
- Example tests in the `src/__tests__` directory. You can run these tests with `npm run test`.
- [GraphQL Code Generator] pre-configured as a `build` step.

## Next Steps

- Setup project with `npm install`
  - This will also run the `postinstall` script which will run `codegen` and compile the project
- Download [Rover] and start it using the command printed as part of rover init

[apollo federation]: https://www.apollographql.com/docs/federation/
[@apollo/server]: https://www.apollographql.com/docs/apollo-server/
[@apollo/subgraph]: https://www.apollographql.com/docs/federation/subgraphs
[rover]: https://www.apollographql.com/docs/rover/
[nodemon]: https://www.npmjs.com/package/nodemon
[GraphQL Code Generator]: https://www.the-guild.dev/graphql/codegen
