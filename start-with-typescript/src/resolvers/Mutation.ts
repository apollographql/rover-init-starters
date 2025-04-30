import { Resolvers } from "../__generated__/resolvers-types";
import { productsSource } from "./productsSource";

export const Mutation: Resolvers = {
  Mutation: {
    createProduct(
      _parent,
      { input }: { input: { name: string; description: string } },
      _context
    ) {
      const newId =
        productsSource.length > 0
          ? String(Math.max(...productsSource.map((p) => Number(p.id))) + 1)
          : "1";
      const newProduct = {
        id: newId,
        name: input.name,
        description: input.description,
      };
      productsSource.push(newProduct);
      return newProduct;
    },
  },
};
