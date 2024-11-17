import { defineChain } from 'viem'

export const rootstockTestnet = defineChain({
	id: 31, // Chain ID for Rootstock Testnet
	name: 'Rootstock Testnet',
	network: 'rootstock-testnet',
	nativeCurrency: {
		name: 'Test RSK Smart Bitcoin',
		symbol: 'tRBTC',
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: ['https://public-node.testnet.rsk.co'],
		},
		public: {
			http: ['https://public-node.testnet.rsk.co'],
		},
	},
	blockExplorers: {
		default: {
			name: 'RSK Explorer',
			url: 'https://explorer.testnet.rootstock.io/',
		},
	},
})
