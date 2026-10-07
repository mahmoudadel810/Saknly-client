// stylis 4.2 ships no type declarations; this covers the one export the emotion RTL cache uses.
declare module 'stylis' {
  export type Middleware = (
    element: any,
    index: number,
    children: any[],
    callback: Middleware,
  ) => string | void;
  export const prefixer: Middleware;
}
