export type GenericObject = { [key: string]: any };

export function stringToObject(str: string): { [key: string]: any } {
  return JSON.parse(str.replace(/\n?```([a-z]+)?\n?/gi, ''));
}

export function objectToString(obj: GenericObject): string {
  return JSON.stringify(obj, null, 2);
}
