import axios from 'axios';

// MetalpriceAPI configuration
const BASE_URL = 'https://api.metalpriceapi.com/v1';
const API_KEY = 'YOUR_API_KEY'; // Replace with actual API key

// Metal symbols mapping
export const METAL_SYMBOLS = {
  GOLD: 'XAU',
  SILVER: 'XAG',
  PLATINUM: 'XPT',
  PALLADIUM: 'XPD',
  COPPER: 'XCU',
  ZINC: 'ZNC',
};

// Metal display names
export const METAL_NAMES = {
  XAU: 'Gold',
  XAG: 'Silver',
  XPT: 'Platinum',
  XPD: 'Palladium',
  XCU: 'Copper',
  ZNC: 'Zinc',
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add API key
apiClient.interceptors.request.use(
  (config) => {
    if (API_KEY && API_KEY !== 'YOUR_API_KEY') {
      config.params = {
        ...config.params,
        api_key: API_KEY,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network Error: Unable to connect to the server');
    } else {
      // Something else happened
      throw new Error(`Request Error: ${error.message}`);
    }
  }
);

/**
 * Get latest prices for all metals
 */
export const getLatestPrices = async () => {
  try {
    const response = await apiClient.get('/latest', {
      params: {
        base: 'USD',
        currencies: Object.values(METAL_SYMBOLS).join(','),
      },
    });

    if (!response.data.success) {
      throw new Error('API returned unsuccessful response');
    }

    return {
      success: true,
      timestamp: response.data.timestamp,
      base: response.data.base,
      rates: response.data.rates,
      lastUpdated: new Date(response.data.timestamp * 1000),
    };
  } catch (error) {
    console.error('Error fetching latest prices:', error);
    throw error;
  }
};

/**
 * Get latest price for a specific metal
 */
export const getMetalPrice = async (metalSymbol) => {
  try {
    const response = await apiClient.get('/latest', {
      params: {
        base: 'USD',
        currencies: metalSymbol,
      },
    });

    if (!response.data.success) {
      throw new Error('API returned unsuccessful response');
    }

    const rate = response.data.rates[`USD${metalSymbol}`];
    
    return {
      success: true,
      metal: metalSymbol,
      metalName: METAL_NAMES[metalSymbol],
      price: rate,
      currency: 'USD',
      timestamp: response.data.timestamp,
      lastUpdated: new Date(response.data.timestamp * 1000),
    };
  } catch (error) {
    console.error(`Error fetching ${metalSymbol} price:`, error);
    throw error;
  }
};

/**
 * Get historical prices for a metal over a date range
 */
export const getHistoricalPrices = async (metalSymbol, startDate, endDate) => {
  try {
    const response = await apiClient.get('/timeframe', {
      params: {
        start_date: startDate,
        end_date: endDate,
        base: 'USD',
        currencies: metalSymbol,
      },
    });

    if (!response.data.success) {
      throw new Error('API returned unsuccessful response');
    }

    return {
      success: true,
      metal: metalSymbol,
      metalName: METAL_NAMES[metalSymbol],
      rates: response.data.rates,
      startDate,
      endDate,
    };
  } catch (error) {
    console.error(`Error fetching historical prices for ${metalSymbol}:`, error);
    throw error;
  }
};

/**
 * Convert metal price to different currency
 */
export const convertMetalPrice = async (metalSymbol, targetCurrency = 'EUR') => {
  try {
    const response = await apiClient.get('/latest', {
      params: {
        base: 'USD',
        currencies: `${metalSymbol},${targetCurrency}`,
      },
    });

    if (!response.data.success) {
      throw new Error('API returned unsuccessful response');
    }

    const metalRate = response.data.rates[`USD${metalSymbol}`];
    const currencyRate = response.data.rates[`USD${targetCurrency}`];
    
    return {
      success: true,
      metal: metalSymbol,
      metalName: METAL_NAMES[metalSymbol],
      priceUSD: metalRate,
      priceConverted: metalRate * currencyRate,
      targetCurrency,
      timestamp: response.data.timestamp,
      lastUpdated: new Date(response.data.timestamp * 1000),
    };
  } catch (error) {
    console.error(`Error converting ${metalSymbol} price:`, error);
    throw error;
  }
};

/**
 * Get price change percentage (mock implementation since API doesn't provide this directly)
 */
export const getPriceChange = async (metalSymbol) => {
  try {
    // Get current price
    const current = await getMetalPrice(metalSymbol);
    
    // Get yesterday's price (mock calculation)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const historical = await apiClient.get(`/${yesterdayStr}`, {
      params: {
        base: 'USD',
        currencies: metalSymbol,
      },
    });

    if (historical.data.success) {
      const previousPrice = historical.data.rates[`USD${metalSymbol}`];
      const change = current.price - previousPrice;
      const changePercent = (change / previousPrice) * 100;
      
      return {
        ...current,
        previousPrice,
        change,
        changePercent,
      };
    }
    
    return current;
  } catch (error) {
    console.error(`Error calculating price change for ${metalSymbol}:`, error);
    // Return current price without change data if historical fetch fails
    return await getMetalPrice(metalSymbol);
  }
};

export default {
  getLatestPrices,
  getMetalPrice,
  getHistoricalPrices,
  convertMetalPrice,
  getPriceChange,
  METAL_SYMBOLS,
  METAL_NAMES,
};
