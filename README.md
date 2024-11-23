# bitcoin-intents
Creating intents to satisfy on Bitcoin transactions 

This was a project done for EthGlobal Bangkok :
https://ethglobal.com/showcase/f-m-o-b-08gjn 


Overview of the Intent-Based BTC Settlement System
This system facilitates cross-chain BTC settlements using Intent creation, escrow management, SPV-based verification, and third-party relayers. It provides a secure and decentralized mechanism to transfer Bitcoin while ensuring that the funds are only released upon successful proof of BTC settlement.

Key Components and Workflow:
1. Intent Creation:
On the source chain, a user interacts with an escrow smart contract to create an Intent.

The Intent specifies:

The recipient's BTC address on the destination chain.
The amount of BTC to be transferred.
Any additional metadata, such as a timeout period or fees for the relayer.
The user's funds (tokens or stablecoins, depending on the chain) are locked into the escrow contract when the Intent is created. These funds act as collateral and are held securely until the Intent is resolved.

2. Relayer Participation:
A relayer (or feeder/filler) monitors the source chain for open Intents. Upon detecting a valid Intent:

The relayer executes a BTC transfer to the recipient’s address specified in the Intent.
The BTC transfer transaction on the Bitcoin network is performed using the relayer's own BTC reserves.
The relayer is incentivized by a fee associated with the Intent, which is paid out upon successful settlement.

3. SPV Verification:
After completing the BTC transfer, the relayer generates a Simplified Payment Verification (SPV) proof for the Bitcoin transaction.

An SPV proof is a lightweight proof mechanism that confirms a BTC transaction’s inclusion in a valid Bitcoin block, without requiring the full block or blockchain history.
The SPV proof includes:

The transaction details (e.g., amount, recipient address).
The Merkle branch proving its inclusion in a valid block.
The block header and hash.
The relayer submits the SPV proof to the escrow smart contract on the source chain.

4. Intent Resolution:
The escrow contract verifies the SPV proof:

It ensures the transaction has been confirmed on the Bitcoin network and meets the conditions specified in the Intent.
Verification ensures that the BTC has been transferred to the correct recipient address and matches the amount required.
Once the SPV proof is validated, the Intent is marked as Resolved.

5. Fund Release to the Relayer:
After the Intent resolution, the escrow contract releases the locked funds to the relayer as payment for fulfilling the Intent.
This concludes the transaction, ensuring the following:
The recipient received their BTC on the destination chain.
The relayer is compensated for their role in facilitating the transfer.
The user’s Intent is successfully fulfilled.
Benefits of the System:
Decentralized Trust:

The SPV verification ensures that BTC transfers are independently validated without relying on centralized authorities.
Security:

Funds are held securely in an escrow contract on the source chain and only released after successful BTC transfer and proof validation.
Efficiency:

Relayers use SPV proofs, which are computationally lightweight, reducing overhead on the source chain and ensuring quick validation.
Interoperability:

The system bridges different blockchain ecosystems (source chain and Bitcoin) seamlessly, enabling cross-chain value transfers.
Incentivized Participation:

Relayers are rewarded for their role in settling Intents, creating an economically sustainable mechanism.
Potential Enhancements:
Timeouts for Unresolved Intents:

If an Intent is not resolved within a predefined time, users should be allowed to withdraw their funds from the escrow.
Multi-Signature Security for Escrow:

Introduce multi-signature functionality in the escrow contract to enhance security.
Layer-2 Integration:

Use Layer-2 solutions for Bitcoin, such as the Lightning Network, to reduce transaction fees and increase settlement speed for BTC transfers.
Auditing & Transparency:

Implement on-chain auditing mechanisms to maintain transparency of relayer actions and ensure fair practices.
Dynamic Fee Adjustment:

Allow the escrow contract to calculate dynamic fees based on network conditions (e.g., Bitcoin transaction fees) to optimize relayer incentives.
This enhanced system description ensures clarity, details the technical flow, and outlines the advantages and potential improvements for broader adoption.
