import { Resolvers } from "../__generated__/resolvers-types";
import { thingsSource } from "./thingsSource";

export const Query: Resolvers = {
  Query: {
    thing(_parent, { id }, _context) {
      return thingsSource.find((t) => t.id === id.toString()) || null;
    },
    things() {
      return thingsSource;
    },
  },
};
