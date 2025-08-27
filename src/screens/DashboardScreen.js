import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  SafeAreaView,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

// Import components and services
import MetalPriceCard from '../components/MetalPriceCard';
import {DashboardLoader, ErrorState} from '../components/LoadingComponents';
import {
  getLatestPrices,
  getPriceChange,
  METAL_SYMBOLS,
  METAL_NAMES,
} from '../services/metalPricesAPI';
import {
  getErrorInfo,
  RetryManager,
  CacheManager,
  checkNetworkStatus,
} from '../utils/errorHandler';
import {useUpdateManager} from '../utils/updateManager';

const DashboardScreen = ({navigation}) => {
  const [metalPrices, setMetalPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isOffline, setIsOffline] = useState(false);

  const retryManager = new RetryManager(3, 1000);

  // Setup automatic updates
  const {recordInteraction, triggerUpdate} = useUpdateManager(
    () => {
      if (!loading && !refreshing) {
        fetchMetalPrices();
      }
    },
    {
      frequency: 60000, // Update every minute
      smart: true, // Use smart scheduling
      autoStart: true,
    }
  );

  // Load cached data on component mount
  useEffect(() => {
    loadCachedData();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        fetchMetalPrices();
      }
    }, [loading])
  );

  const loadCachedData = async () => {
    try {
      const cachedPrices = await CacheManager.getCachedData(
        CacheManager.CACHE_KEYS.METAL_PRICES,
        10 * 60 * 1000 // 10 minutes
      );
      
      if (cachedPrices) {
        setMetalPrices(cachedPrices);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.warn('Failed to load cached data:', error);
    }
  };

  const fetchMetalPrices = async () => {
    try {
      setError(null);
      
      // Check network status
      const isOnline = await checkNetworkStatus();
      setIsOffline(!isOnline);
      
      if (!isOnline) {
        // Try to load cached data if offline
        await loadCachedData();
        setLoading(false);
        return;
      }

      // Fetch latest prices with retry mechanism
      const pricesData = await retryManager.executeWithRetry(getLatestPrices);
      
      // Process each metal individually
      const processedPrices = {};
      
      for (const metalSymbol of Object.values(METAL_SYMBOLS)) {
        try {
          const metalData = await retryManager.executeWithRetry(
            getPriceChange,
            metalSymbol
          );
          processedPrices[metalSymbol] = metalData;
        } catch (metalError) {
          console.warn(`Failed to fetch ${metalSymbol} data:`, metalError);
          // Keep existing data if available
          if (metalPrices[metalSymbol]) {
            processedPrices[metalSymbol] = metalPrices[metalSymbol];
          }
        }
      }

      setMetalPrices(processedPrices);
      setLastUpdated(new Date());
      
      // Cache the data
      await CacheManager.cacheData(
        CacheManager.CACHE_KEYS.METAL_PRICES,
        processedPrices
      );
      
    } catch (error) {
      console.error('Error fetching metal prices:', error);
      const errorInfo = getErrorInfo(error);
      setError(errorInfo);
      
      // Try to load cached data as fallback
      await loadCachedData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetalPrices();
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchMetalPrices();
  };

  const handleMetalPress = (metalData) => {
    recordInteraction(); // Track user interaction for smart updates
    navigation.navigate('MetalDetail', {
      metalSymbol: metalData.metal,
      metalName: metalData.metalName,
      metalData: metalData,
    });
  };

  const renderMetalCards = () => {
    return Object.values(METAL_SYMBOLS).map((metalSymbol) => {
      const metalData = metalPrices[metalSymbol];
      
      if (!metalData) {
        return (
          <MetalPriceCard
            key={metalSymbol}
            metalData={{
              metal: metalSymbol,
              metalName: METAL_NAMES[metalSymbol],
              price: null,
              currency: 'USD',
            }}
            onPress={() => handleMetalPress({
              metal: metalSymbol,
              metalName: METAL_NAMES[metalSymbol],
            })}
          />
        );
      }

      return (
        <MetalPriceCard
          key={metalSymbol}
          metalData={metalData}
          onPress={() => handleMetalPress(metalData)}
        />
      );
    });
  };

  if (loading) {
    return <DashboardLoader />;
  }

  if (error && Object.keys(metalPrices).length === 0) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFD700"
            colors={['#FFD700']}
          />
        }>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Metal Prices</Text>
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <Text style={styles.offlineText}>📶 Offline - Showing cached data</Text>
            </View>
          )}
        </View>

        {/* Error Banner */}
        {error && Object.keys(metalPrices).length > 0 && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              ⚠️ Some data may be outdated due to connection issues
            </Text>
          </View>
        )}

        {/* Metal Cards Grid */}
        <View style={styles.cardsContainer}>
          {renderMetalCards()}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Prices are indicative and may not reflect actual trading prices
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    color: '#999',
    fontSize: 14,
  },
  offlineIndicator: {
    backgroundColor: '#FF9800',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#F44336',
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorBannerText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 12,
  },
  footer: {
    padding: 20,
    paddingTop: 10,
  },
  footerText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DashboardScreen;
