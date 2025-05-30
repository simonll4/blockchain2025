// src/stores/contract.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ethers } from 'ethers'
import factoryArtifact from '../../../contracts/build/contracts/CFPFactory.json'

const ABI = factoryArtifact.abi
const NETWORKS = factoryArtifact.networks
const NETWORK_ID = '5777'

export const useContractStore = defineStore('contract', () => {
  const factoryAddress = ref<string>('')
  const contract = ref<ethers.Contract | null>(null)

  const loadFactoryAddress = () => {
    const network = NETWORKS[NETWORK_ID]
    if (!network || !network.address) {
      throw new Error(`No se encontró la dirección del contrato para la red ${NETWORK_ID}`)
    }
    factoryAddress.value = network.address
  }

  const initContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
    if (!factoryAddress.value) loadFactoryAddress()
    contract.value = new ethers.Contract(factoryAddress.value, ABI, signerOrProvider)
  }

  return {
    factoryAddress,
    contract,
    initContract,
  }
})
