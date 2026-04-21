declare module "node:fs" {
  function readFileSync(path: string | URL, encoding: BufferEncoding): string;
}
