import { Resolvers } from "../__generated__/resolvers-types";
import { thingsSource } from "./thingsSource";

export const Mutation: Resolvers = {
  Mutation: {
    createThing(_parent, { thing }, _context) {
      const exists = thingsSource.some((t) => t.id === thing.id);
      const newThing = { id: thing.id, name: thing.name };
      if (!exists) {
        thingsSource.push(newThing);
      }
      return newThing;
    },
  },
};
