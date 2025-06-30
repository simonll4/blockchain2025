export const shorten = (address: string): string => {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

const isAddress = (value: string) => /^0x[a-fA-F0-9]{40}$/.test(value);

export const formatAdressOrName = (creator: string) => {
  return isAddress(creator) ? shorten(creator) : creator;
};

export const format = {
  shorten,
  formatCreator: formatAdressOrName,
};
