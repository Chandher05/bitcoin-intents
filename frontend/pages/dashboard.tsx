import AuthenticatedPage from '@/components/authenticated-page'
import Section from '@/components/section'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { links } from '@/lib/links'
import Image from 'next/image'
import { useEffect, useState } from 'react'
// import { baseSepolia, rootstock } from 'viem/chains'
import { createPublicClient, defineChain, formatEther, http } from 'viem'
import Link from 'next/link'
import { rootstockTestnet } from '@/util/chainDefine'
import { baseSepolia } from 'viem/chains'

// const rootstockTestnet = defineChain({
// 	id: 31, // Chain ID for Rootstock Testnet
// 	name: 'Rootstock Testnet',
// 	network: 'rootstock-testnet',
// 	nativeCurrency: {
// 		name: 'Test RSK Smart Bitcoin',
// 		symbol: 'tRBTC',
// 		decimals: 18,
// 	},
// 	rpcUrls: {
// 		default: {
// 			http: ['https://public-node.testnet.rsk.co'],
// 		},
// 		public: {
// 			http: ['https://public-node.testnet.rsk.co'],
// 		},
// 	},
// 	blockExplorers: {
// 		default: {
// 			name: 'RSK Explorer',
// 			url: 'https://explorer.testnet.rootstock.io/',
// 		},
// 	},
// })

const Dashboard = () => {
	// You can also import other linking methods, like linkWallet, linkEmail, linkDiscord, etc.
	const { user, linkPhone, linkGoogle, linkApple } = usePrivy()

	const [balance, setBalance] = useState('')
	const [isLoading, setIsLoading] = useState(true)

	const { wallets } = useWallets()
	const embeddedWallet = wallets.find(
		(wallet) => wallet.walletClientType === 'privy'
	)
	console.log({ embeddedWallet })
	useEffect(() => {
		const fetchBalance = async () => {
			if (!user?.wallet?.address) {
				setIsLoading(false)
				return
			}

			try {
				setIsLoading(true)
				// Create a public client
				const client = createPublicClient({
					chain: rootstockTestnet,
					transport: http(),
				})

				// Get native token balance
				const balanceWei = await client.getBalance({
					address: embeddedWallet?.address as `0x${string}`,
				})

				// Convert from Wei to ETH (or the chain's native token)
				const formattedBalance = formatEther(balanceWei)
				// Format to 4 decimal places
				setBalance(Number(formattedBalance).toFixed(4))
			} catch (error) {
				console.error('Error fetching balance:', error)
				setBalance('Error')
			} finally {
				setIsLoading(false)
			}
		}

		fetchBalance()
	}, [user?.wallet])
	return (
		<AuthenticatedPage>
			<Section>
				<div className='  flex justify-center items-center w-full'>
					{embeddedWallet?.address && (
						<img
							alt='FMOB'
							width={200}
							className=' ring-1 rounded-full'
							height={200}
							src={`https://noun.pics/${
								generateTwoDigitNumber(embeddedWallet?.address) || '0'
							}`}
						/>
					)}
				</div>
			</Section>
			<Section>
				<div className='mt-6 text-center'>
					<span className='text-2xl font-bold'>
						{isLoading ? 'Loading...' : `${balance} trBTC`}
					</span>
				</div>
			</Section>

			{/* <Section>
				<p className='text-md mt-2 font-bold uppercase text-gray-700'>
					Your User Object
				</p>
				<p className='mt-2 text-sm text-gray-600'>
					Inspect your linked accounts, or{' '}
					<a
						href={links.docs.userObject}
						className='underline'
						target='_blank'
						rel='noreferrer noopener'
					>
						learn more
					</a>
					.
				</p>
				<textarea
					value={JSON.stringify(user, null, 2)}
					className='mt-4 h-64 w-full rounded-md bg-slate-700 p-4 font-mono text-xs text-slate-50 disabled:bg-slate-700'
					rows={JSON.stringify(user, null, 2).split('\n').length}
					readOnly
				/>
			</Section> */}
			<div className=' flex justify-center items-center w-full'>
				<Link
					className='my-4 w-full rounded-md bg-[#18001B] hover:shadow-2xl px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:bg-[#808080]'
					href={'/bridge-btc'}
					// onClick={login}
					// Always check that Privy is `ready` and the user is not `authenticated` before calling `login`
					// disabled={!ready || authenticated}
				>
					<p className='text-center'>GET SOME BITCOIN!!!!!!</p>
				</Link>
			</div>
		</AuthenticatedPage>
	)
}

export default Dashboard

function generateTwoDigitNumber(address: string) {
	// Validate the address
	if (!address || typeof address !== 'string' || !address.startsWith('0x')) {
		throw new Error('Invalid Ethereum address')
	}

	// Take the first 4 characters after '0x' and convert to decimal
	const firstBytes = address.slice(2, 6)
	const decimal = parseInt(firstBytes, 16)

	// Get a number between 0-99 using modulo
	const twoDigitNumber = decimal % 100

	// Pad with leading zero if needed
	return twoDigitNumber.toString().padStart(2, '0')
}
