export interface Loader {
  /**
   * 加载方法
   */
  load(): void;

  /**
   * 卸载方法
   */
  unload?(): void;
}
