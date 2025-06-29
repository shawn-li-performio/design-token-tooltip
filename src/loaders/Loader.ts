export interface Loader {
  load(): void;

  unload?(): void;
}
