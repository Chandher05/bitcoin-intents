import { ethers } from "ethers";
import dotenv from "dotenv";
import {contract_abi} from "./contract-abi.js";  // Note: .js extension is required for ES modules

dotenv.config();


async function main() {
    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.EVM_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        contract_abi,
        wallet
    );

    console.log('Starting intent resolution process...');

    // Function to fetch and process a single intent
    async function processIntent(intentId) {
        try {
            // Fetch intent details
            const returnData = await contract.getIntent(intentId);

            console.log(returnData)
            
            // console.log(`\nIntent ${intentId}:`);
            // console.log(`Creator: ${creator}`);
            // console.log(`Description: ${description}`);
            // console.log(`State: ${state}`); // 0 = PENDING, 1 = RESOLVED
            // console.log(`Amount: ${ethers.formatEther(amount)} ETH`);

            // // Check if intent is pending (state === 0)
            // if (state === 0) {
            //     console.log(`Attempting to resolve intent ${intentId}...`);
            //     try {
            //         // Resolve the intent
            //         const tx = await contract.resolveIntent(intentId);
            //         console.log(`Waiting for transaction confirmation...`);
            //         await tx.wait();
            //         console.log(`Successfully resolved intent ${intentId}`);
            //         console.log(`Transaction hash: ${tx.hash}`);
            //     } catch (error) {
            //         console.error(`Error resolving intent ${intentId}:`, error.message);
            //     }
            // } else {
            //     console.log(`Intent ${intentId} is already resolved`);
            // }
        } catch (error) {
            if (error.message.includes("invalid intent id") || error.message.includes("Intent does not exist")) {
                console.log(`Intent ${intentId} does not exist`);
                return false;
            }
            console.error(`Error processing intent ${intentId}:`, error.message);
        }
        return true;
    }

    // Process intents sequentially
    let intentId = 1;
    let exists = true;

    while (exists < 5) {
        console.log(`\nChecking intent ${intentId}...`);
        exists = await processIntent(intentId);
        if (exists) {
            intentId++;
        }
    }

    console.log('\nFinished processing all intents');
}

// Execute the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });