import { Resolvers } from "../__generated__/resolvers-types";
import { productsSource } from "./productsSource";

export const Query: Resolvers = {
  Query: {
    product(_parent, { id }, _context) {
      const product = productsSource.find((p) => String(p.id) === String(id));
      return product ? { ...product } : null;
    },
    products() {
      return productsSource.map((p) => ({ ...p }));
    },
  },
};
