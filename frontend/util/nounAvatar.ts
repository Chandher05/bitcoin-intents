import { getNounData, getNounSeedFromBlockHash, ImageData } from "@nouns/assets";
import { buildSVG } from "@nouns/sdk";

export const getNounAvatar = (blockhash: string) => {
    const uniqueNumber = hashString(blockhash);
    const seed = getNounSeedFromBlockHash(uniqueNumber, padTo32Bytes(blockhash));
    const { parts, background } = getNounData(seed);
    const { palette } = ImageData; // Used with `buildSVG``
    const svgBinary = buildSVG(parts, palette, background);
    const svgBase64 = btoa(svgBinary);
    return `data:image/svg+xml;base64,${svgBase64}`;
};

function padTo32Bytes(hexAddress: string): string {
    // Remove the '0x' prefix if present
    let cleanHexAddress = hexAddress?.startsWith("0x")
        ? hexAddress?.substring(2)
        : hexAddress;

    // Check if the address is already 32 bytes (64 hex characters)
    if (cleanHexAddress?.length === 64) {
        return "0x" + cleanHexAddress;
    }

    // Pad zeros to make it 32 bytes (64 hex characters)
    const paddingNeeded = 64 - cleanHexAddress?.length;
    cleanHexAddress = "0".repeat(paddingNeeded) + cleanHexAddress;

    return "0x" + cleanHexAddress;
}

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str?.length; i++) {
        const char = str?.charCodeAt(i);
        hash = (hash << 5) - hash + char;
    }
    hash = Math.abs(hash);
    hash = hash % 100000;
    if (hash < 10000) {
        hash += 10000;
    }
    return hash;
}