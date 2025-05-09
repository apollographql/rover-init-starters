interface Template {
  id: string;
  display_name: string;
  path: string;
  language: string;
  federation_version: string;
  max_schema_depth: number;
  routing_url: string;
  command?: string;
}

interface Manifest {
  templates: Template[];
}

declare const manifest: Manifest;
export = manifest; 