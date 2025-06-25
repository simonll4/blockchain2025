import { keccak256, toUtf8Bytes, getBytes, concat } from "ethers";

export function namehash(name: string): string {
  let node = new Uint8Array(32); // 32 bytes de cero (buffer inicial)

  if (name) {
    const labels = name.split(".").reverse();

    for (const label of labels) {
      const labelHash = getBytes(keccak256(toUtf8Bytes(label)));
      node = getBytes(keccak256(concat([node, labelHash])));
    }
  }

  return "0x" + [...node].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function labelhash(label: string): string {
  return keccak256(toUtf8Bytes(label));
}
