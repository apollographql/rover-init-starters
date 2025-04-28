import { readFileSync } from "fs";
import gql from "graphql-tag";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { ApolloServer, ContextFunction } from "@apollo/server";
import {
  StandaloneServerContextFunctionArgument,
  startStandaloneServer,
} from "@apollo/server/standalone";
import resolvers from "./resolvers";
import { DataSourceContext } from "./types/DataSourceContext";
import { GraphQLError } from "graphql";

const port = "4001";
const subgraphName = "things";

async function main() {
  let typeDefs = gql(
    readFileSync("things.graphql", {
      encoding: "utf-8",
    })
  );
  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: Number.parseInt(port) },
  });

  console.log(`🚀  Subgraph ${subgraphName} ready at ${url}`);
}

main();
