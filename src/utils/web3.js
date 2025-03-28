import { InjectedConnector } from '@web3-react/injected-connector'
import { Web3Provider } from '@ethersproject/providers'

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97, 1337, 31337] // Các chain ID hỗ trợ
})

export function getLibrary(provider) {
  return new Web3Provider(provider)
}
