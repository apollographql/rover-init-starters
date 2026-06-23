import { Resolvers, MutationCreateProductArgs } from "../__generated__/resolvers-types";
import { productsSource } from "./productsSource";
import { GraphQLError } from "graphql";

export const Mutation: Resolvers = {
  Mutation: {
    createProduct(
      _parent,
      { input }: MutationCreateProductArgs,
      _context
    ) {
      if (!input.name || input.name.trim() === "") {
        throw new GraphQLError("Product name is required.", { extensions: { code: "BAD_USER_INPUT" } });
      }
      if (!input.description || input.description.trim() === "") {
        throw new GraphQLError("Product description is required.", { extensions: { code: "BAD_USER_INPUT" } });
      }
      if (productsSource.some((p) => p.name === input.name)) {
        throw new GraphQLError("A product with this name already exists.", { extensions: { code: "BAD_USER_INPUT" } });
      }
      const newId =
        productsSource.length > 0
          ? String(Math.max(...productsSource.map((p) => Number(p.id))) + 1)
          : "1";
      const newProduct = {
        id: newId,
        name: input.name,
        description: input.description,
      };
      productsSource.push({ ...newProduct });
      return { ...newProduct };
    },
  },
};
