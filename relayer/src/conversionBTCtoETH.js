export async function ethToBtc(ethAmount) {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=btc'
      );
      const data = await response.json();
      const rate = data.ethereum.btc;
      const btcValue = ethAmount * rate;
      
    //   return {
    //     rate,
    //     btcValue: btcValue.toFixed(8),
    //     timestamp: new Date().toISOString()
    //   };

    return btcValue.toFixed(8)
    } catch (error) {
      console.error('Error fetching conversion rate:', error);
      throw error;
    }
  }
  
  // Example usage:
