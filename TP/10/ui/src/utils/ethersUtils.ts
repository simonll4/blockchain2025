import { ethers } from "ethers";

export const calculateFileHash = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(buffer);
        const hash = ethers.sha256(uint8Array);
        resolve(hash);
      } catch (err) {
        reject(new Error("Error procesando el archivo"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error leyendo el archivo"));
    };

    reader.readAsArrayBuffer(file);
  });
};

// export const isValidEtherAddress = (address: string) => {
//   return ethers.utils.isAddress(address);
// };

// ========================
// 🚀 Exportación única
// ========================
export const EthersUtils = {
  calculateFileHash,
  //   isValidEtherAddress,
};
