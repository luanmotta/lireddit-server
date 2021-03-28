export const sleep = (ms: number) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve) => setTimeout(resolve, ms))
