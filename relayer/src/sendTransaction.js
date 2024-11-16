import bitcoin from "bitcoinjs-lib";
const ecc = require('tiny-secp256k1');
import { ECPairFactory } from "ecpair";
import axios from "axios";
import { BIP32Factory } from "bip32";


const ECPair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);
bitcoin.initEccLib(ecc);

const ESPLORA_API_BASE = "https://esplora.signet.surge.dev"; 

export async function sendTaprootTransaction(fromPrivateKey, toAddress, amountSats) {
  const network = bitcoin.networks.testnet;
  try {
    const keyPair = ECPair.fromWIF(fromPrivateKey, network);

    const account = bip32.fromPrivateKey(
      keyPair.privateKey,
      toXOnly(keyPair.publicKey),
      network
    );

    const internalPubkey = toXOnly(keyPair.publicKey);

    const tweakedChildNode = account?.tweak(
      bitcoin.crypto.taggedHash("TapTweak", internalPubkey)
    );

    const { address: fromAddress } = bitcoin.payments.p2tr({
      internalPubkey,
      network,
    });

    // Fetch UTXOs
    const utxos = await axios.get(
      `${ESPLORA_API_BASE}/address/${fromAddress}/utxo`
    );

    const psbt = new bitcoin.Psbt({ network });
    let totalInput = 0;

    for (const utxo of utxos.data) {
      const tx = await axios.get(`${ESPLORA_API_BASE}/tx/${utxo.txid}/hex`);
      const prevTx = bitcoin.Transaction.fromHex(tx.data);

      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: prevTx.outs[utxo.vout],
        tapInternalKey: internalPubkey,
      });

      totalInput += utxo.value;
      if (totalInput >= amountSats + 1000) break; // Add some for fees
    }

    if (totalInput < amountSats) {
      throw new Error("Insufficient funds");
    }

    // Add outputs
    psbt.addOutput({
      address: toAddress,
      value: amountSats,
    });

    const fee = 1000; // Set an appropriate fee
    if (totalInput > amountSats + fee) {
      psbt.addOutput({
        address: fromAddress,
        value: totalInput - amountSats - fee,
      });
    }

    // Sign inputs
    for (let i = 0; i < psbt.inputCount; i++) {
      psbt.signInput(i, tweakedChildNode);
    }

    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction();
    const txHex = tx.toHex();

    // Broadcast transaction
    const broadcastResult = await axios.post(`${ESPLORA_API_BASE}/tx`, txHex);
    return broadcastResult.data; // This should be the transaction ID
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw error;
  }
}

function toXOnly(pubkey) {
  return pubkey.slice(1, 33);
}

export function generateNewAddress(network = bitcoin.networks.testnet) {
  // Generate a new key pair
  const keyPair = ECPair.makeRandom({ network });

  // Derive the public key
  const { publicKey } = keyPair;

  // Create a P2TR (Pay to Taproot) address
  const { address } = bitcoin.payments.p2tr({
    internalPubkey: publicKey.slice(1, 33), // Convert to x-only public key
    network,
  });

  return {
    address,
    privateKey: keyPair.toWIF(),
    publicKey: publicKey.toString("hex"),
  };
}

// New route to create a Bitcoin address


