import React, { useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { createWalletClient, custom, parseEther } from 'viem'
import { baseSepolia } from 'viem/chains'
import { contract_abi } from '../util/contractAbi'
import Section from '@/components/section'
import Image from 'next/image'
import { rootstockTestnet } from '@/util/chainDefine'

// const contractAddress = '0x648Cd2050439113Bf36f84eDaA12C3f16f6A9885' //
const contractAddress = '0xc87dC55dd0F7Af96F7757c5A70Ec44296db3466e' //

const CreateIntentForm = () => {
	const [description, setDescription] = useState('')
	const [amount, setAmount] = useState('')
	const [txHash, setTxHash] = useState('')
	const [txIsLoading, setTxIsLoading] = useState(false)

	const { wallets } = useWallets()
	const embeddedWallet = wallets.find(
		(wallet) => wallet.walletClientType === 'privy'
	)

	console.log({ addR: embeddedWallet?.address || '' })

	const handleCreateIntent = async (e: any) => {
		e.preventDefault()
		if (!embeddedWallet) return

		setTxIsLoading(true)
		try {
			// Switch network to Base Goerli (or your desired network)
			await embeddedWallet.switchChain(rootstockTestnet.id)

			// Get provider from embedded wallet
			const provider = await embeddedWallet.getEthereumProvider()

			// Create viem wallet client
			const walletClient = createWalletClient({
				account: embeddedWallet.address as `0x${string}`,
				chain: rootstockTestnet,
				transport: custom(provider),
			})

			// Create the intent transaction
			const _txHash = await walletClient.writeContract({
				account: embeddedWallet.address as `0x${string}`,
				address: contractAddress,
				abi: contract_abi,
				functionName: 'createIntent',
				args: [description],
				value: parseEther(amount),
			})

			setTxHash(_txHash)

			// Reset form
			setDescription('')
			setAmount('')
		} catch (e) {
			console.error('Failed to create intent:', e)
		}
		setTxIsLoading(false)
	}

	return (
		<div className='max-w-md mx-auto p-4'>
			<Section>
				<div className='  flex justify-center items-center w-full'>
					<Image alt='FMOB' width={200} height={200} src='/images/FMOB.png' />
				</div>
			</Section>

			{!txHash && (
				<form onSubmit={handleCreateIntent} className='space-y-4'>
					<div>
						<label>BTC Address</label>
						<input
							type='text'
							placeholder='eg: tb1qd7p6yc0a4a9ec9plkwy4m5s9yy3t4ewx0z5er7'
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className='form-input mt-2 w-full rounded-lg border-2 border-gray-200 px-4 py-3'
						/>
					</div>

					<div>
						<label>Amount in Native Token:</label>
						<input
							type='number'
							step='0.000000000000000001'
							placeholder='Amount in ETH/tBTC'
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className='form-input mt-2 w-full rounded-lg border-2 border-gray-200 px-4 py-3'
						/>
					</div>

					<button
						type='submit'
						disabled={!description || !amount || txIsLoading}
						className='w-full rounded-md bg-black py-2 text-sm font-semibold text-white hover:shadow-2xl shadow-sm disabled:bg-gray-500 disabled:shadow-none'
					>
						{txIsLoading ? 'Creating Intent...' : 'Create Bitcoin Intent'}
					</button>
				</form>
			)}
			{txHash && (
				<div className='text-center'>
					<p className='mt-2 text-sm italic select-text text-gray-600'>
						Transaction hash: {txHash}
					</p>
					<p>Bitcoin Intent has been created</p>
				</div>
			)}
		</div>
	)
}

export default CreateIntentForm
