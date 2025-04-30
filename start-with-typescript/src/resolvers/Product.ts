import { Resolvers } from "../__generated__/resolvers-types";
import { productsSource } from "./productsSource";

export const Product: Resolvers = {
  Product: {
    __resolveReference(reference) {
      const product = productsSource.find(
        (p) => String(p.id) === String(reference.id)
      );
      return product ? { ...product, id: String(product.id) } : null;
    },
    // Add any field resolvers here if needed in the future
  },
};
