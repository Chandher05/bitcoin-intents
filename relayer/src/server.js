import { ethers } from "ethers";
import dotenv from "dotenv";
import { contract_abi } from "./contract-abi.js";  // Note: .js extension is required for ES modules
import { ethToBtc } from "./conversionBTCtoETH.js";
import Client from "bitcoin-core";
dotenv.config();

const FROM_ADDRESS = process.env.FROM_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.FROM_ADDRESS;

// const SEND_AMOUNT = 0.02; // Amount in BTC
const SEND_AMOUNT_SATS = (Amount) => Math.floor(Amount * 100000000);


const client = new Client({
    network: "testnet",
    host: process.env.BITCOIN_IP,
    port: process.env.BITCOIN_RCP_PORT,
    username: process.env.BITCOIN_USERNAME,
    password: process.env.BITCOIN_PASSWORD,
    timeout: 1200000,
});

async function main() {
    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.EVM_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
        process.env.CONTRACT_ADDRESS,
        contract_abi,
        wallet
    );


    async function resolveIntent(contractInstance, intentId) {
        try {
            // Call the resolveIntent function with the intent ID
            const tx = await contract.resolveIntent(intentId);

            // Wait for the transaction to be mined
            await tx.wait();

            console.log(`Intent ${intentId} has been resolved successfully`);
            return true;
        } catch (error) {
            console.error('Error resolving intent:', error);
            throw error;
        }
    }

    console.log('Starting intent resolution process...');

    // Function to fetch and process a single intent
    async function processIntent(intentId) {
        try {
            // Fetch intent details
            const [id, creator, bitcoin_address, intent_state, amount] = await contract.getIntent(intentId);


            // if(intent_state == 1) {
            //     console.log(`Intent with id: ${intentId} has been resolved!`);
            //     return;
            // }


            const amountInETH = ethers.formatEther(amount);
            const amountInBTC = await ethToBtc(amountInETH);

            console.log(`\nIntent ${id}:`);
            console.log(`Creator: ${creator}`);
            console.log(`Description: ${bitcoin_address}`);
            console.log(`State: ${intent_state}`); // 0 = PENDING, 1 = RESOLVED
            console.log(`Amount: ${ethers.formatEther(amount)} ETH`);
            console.log(`Amount in BTC ${amountInBTC}`);


            // // Check if intent is pending (state === 0)
            if (intent_state === 0) {

                console.log(`Attempting to resolve intent ${intentId}...`);
                const txid = await sendTaprosotTransaction(
                    PRIVATE_KEY,
                    bitcoin_address,
                    SEND_AMOUNT_SATS(amountInBTC)
                );
                if(!txid) throw new Error("Bitcoin Transaction not complete!");
                
                console.log("Transaction from bitcoin:", txid);
                try {
                    // Resolve the intent
                    const tx = await contract.resolveIntent(intentId);
                    console.log(`Waiting for transaction confirmation...`);
                    await tx.wait();
                    console.log(`Successfully resolved intent ${intentId}`);
                    console.log(`Transaction hash: ${tx.hash}`);

                } catch (error) {
                    console.error(`Error resolving intent ${intentId}:`, error.message);
                }
            } else {
                console.log(`Intent ${intentId} is already resolved`);
            }
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
    exists = await processIntent(intentId);

    // while (exists && intentId < 4) {
    //     console.log(`\nChecking intent ${intentId}...`);
    //     if (exists) {
    //         intentId++;
    //     }
    // }

    console.log('\nFinished processing all intents');
}

// Execute the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });