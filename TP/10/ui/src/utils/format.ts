export const shorten = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const format = {
  shorten,
};
