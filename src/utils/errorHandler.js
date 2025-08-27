import AsyncStorage from '@react-native-async-storage/async-storage';

// Error types
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  DATA_PARSING_ERROR: 'DATA_PARSING_ERROR',
  OFFLINE_ERROR: 'OFFLINE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Error messages for user display
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK_ERROR]: {
    title: 'Connection Problem',
    message: 'Please check your internet connection and try again.',
    action: 'Retry',
  },
  [ERROR_TYPES.API_ERROR]: {
    title: 'Service Unavailable',
    message: 'The metal prices service is temporarily unavailable.',
    action: 'Try Again',
  },
  [ERROR_TYPES.TIMEOUT_ERROR]: {
    title: 'Request Timeout',
    message: 'The request took too long to complete. Please try again.',
    action: 'Retry',
  },
  [ERROR_TYPES.RATE_LIMIT_ERROR]: {
    title: 'Too Many Requests',
    message: 'You have made too many requests. Please wait a moment and try again.',
    action: 'Wait & Retry',
  },
  [ERROR_TYPES.AUTHENTICATION_ERROR]: {
    title: 'Authentication Failed',
    message: 'There was a problem with the API authentication.',
    action: 'Contact Support',
  },
  [ERROR_TYPES.DATA_PARSING_ERROR]: {
    title: 'Data Error',
    message: 'There was a problem processing the metal price data.',
    action: 'Retry',
  },
  [ERROR_TYPES.OFFLINE_ERROR]: {
    title: 'You\'re Offline',
    message: 'Please check your internet connection to get live prices.',
    action: 'Check Connection',
  },
  [ERROR_TYPES.UNKNOWN_ERROR]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    action: 'Retry',
  },
};

/**
 * Classify error based on error object
 */
export const classifyError = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN_ERROR;

  const errorMessage = error.message?.toLowerCase() || '';
  
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return ERROR_TYPES.NETWORK_ERROR;
  }
  
  if (errorMessage.includes('timeout')) {
    return ERROR_TYPES.TIMEOUT_ERROR;
  }
  
  if (error.response?.status === 429) {
    return ERROR_TYPES.RATE_LIMIT_ERROR;
  }
  
  if (error.response?.status === 401 || error.response?.status === 403) {
    return ERROR_TYPES.AUTHENTICATION_ERROR;
  }
  
  if (error.response?.status >= 500) {
    return ERROR_TYPES.API_ERROR;
  }
  
  if (errorMessage.includes('json') || errorMessage.includes('parse')) {
    return ERROR_TYPES.DATA_PARSING_ERROR;
  }
  
  return ERROR_TYPES.UNKNOWN_ERROR;
};

/**
 * Get user-friendly error information
 */
export const getErrorInfo = (error) => {
  const errorType = classifyError(error);
  return {
    type: errorType,
    ...ERROR_MESSAGES[errorType],
    originalError: error,
  };
};

/**
 * Retry mechanism with exponential backoff
 */
export class RetryManager {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
  }

  async executeWithRetry(asyncFunction, ...args) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await asyncFunction(...args);
      } catch (error) {
        lastError = error;
        
        // Don't retry for certain error types
        const errorType = classifyError(error);
        if (errorType === ERROR_TYPES.AUTHENTICATION_ERROR || 
            errorType === ERROR_TYPES.RATE_LIMIT_ERROR) {
          throw error;
        }
        
        // If this was the last attempt, throw the error
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        // Calculate delay with exponential backoff
        const delay = this.baseDelay * Math.pow(2, attempt);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Cache manager for offline support
 */
export class CacheManager {
  static CACHE_KEYS = {
    METAL_PRICES: 'metal_prices_cache',
    LAST_UPDATE: 'last_update_timestamp',
  };

  static async cacheData(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static async getCachedData(key, maxAge = 5 * 60 * 1000) { // 5 minutes default
    try {
      const cachedString = await AsyncStorage.getItem(key);
      if (!cachedString) return null;

      const cached = JSON.parse(cachedString);
      const age = Date.now() - cached.timestamp;

      if (age > maxAge) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }

  static async clearCache() {
    try {
      const keys = Object.values(this.CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
}

/**
 * Error boundary helper for React components
 */
export const withErrorBoundary = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        const errorInfo = getErrorInfo(this.state.error);
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <Text style={{ color: '#fff', fontSize: 18, marginBottom: 10 }}>
              {errorInfo.title}
            </Text>
            <Text style={{ color: '#ccc', textAlign: 'center' }}>
              {errorInfo.message}
            </Text>
          </View>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  };
};

/**
 * Network status checker
 */
export const checkNetworkStatus = async () => {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default {
  ERROR_TYPES,
  classifyError,
  getErrorInfo,
  RetryManager,
  CacheManager,
  withErrorBoundary,
  checkNetworkStatus,
};
