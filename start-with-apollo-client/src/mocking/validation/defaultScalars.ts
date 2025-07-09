import { z } from 'zod';

export type DefaultScalars = {
  String: any;
  Int: any;
  Boolean: any;
  Float: any;
  ID: any;
};

export const defaultScalars: DefaultScalars = {
  String: z.string(),
  Int: z.number(),
  Boolean: z.boolean(),
  Float: z.number(),
  ID: z.string(),
};
