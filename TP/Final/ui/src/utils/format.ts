export const shorten = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

export const formatCreator = (creator: string) => {
  return isAddress(creator) ? shorten(creator) : creator;
};

export const format = {
  shorten,
  formatCreator,
};
