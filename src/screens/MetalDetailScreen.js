import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import moment from 'moment';

// Import components and services
import {LoadingSpinner, ErrorState} from '../components/LoadingComponents';
import {
  getMetalPrice,
  getPriceChange,
  getHistoricalPrices,
  convertMetalPrice,
} from '../services/metalPricesAPI';
import {
  getErrorInfo,
  RetryManager,
  CacheManager,
} from '../utils/errorHandler';

const MetalDetailScreen = ({route, navigation}) => {
  const {metalSymbol, metalName, metalData: initialData} = route.params;
  
  const [metalData, setMetalData] = useState(initialData || null);
  const [historicalData, setHistoricalData] = useState(null);
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [showConversion, setShowConversion] = useState(false);

  const retryManager = new RetryManager(3, 1000);

  useEffect(() => {
    if (!initialData) {
      fetchMetalData();
    } else {
      fetchAdditionalData();
    }
  }, [metalSymbol]);

  const fetchMetalData = async () => {
    try {
      setError(null);
      
      const data = await retryManager.executeWithRetry(
        getPriceChange,
        metalSymbol
      );
      
      setMetalData(data);
      await fetchAdditionalData();
      
    } catch (error) {
      console.error('Error fetching metal data:', error);
      const errorInfo = getErrorInfo(error);
      setError(errorInfo);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAdditionalData = async () => {
    try {
      // Fetch historical data for the past 7 days
      const endDate = moment().format('YYYY-MM-DD');
      const startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
      
      const historical = await retryManager.executeWithRetry(
        getHistoricalPrices,
        metalSymbol,
        startDate,
        endDate
      );
      
      setHistoricalData(historical);
      
    } catch (error) {
      console.warn('Failed to fetch historical data:', error);
    }
  };

  const fetchConvertedPrice = async (currency) => {
    try {
      const converted = await retryManager.executeWithRetry(
        convertMetalPrice,
        metalSymbol,
        currency
      );
      
      setConvertedPrice(converted);
      setSelectedCurrency(currency);
      setShowConversion(true);
      
    } catch (error) {
      console.error('Error converting price:', error);
      Alert.alert('Error', 'Failed to convert price. Please try again.');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetalData();
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchMetalData();
  };

  const getMetalColor = (metalSymbol) => {
    const colors = {
      XAU: '#FFD700', // Gold
      XAG: '#C0C0C0', // Silver
      XPT: '#E5E4E2', // Platinum
      XPD: '#CED0DD', // Palladium
      XCU: '#B87333', // Copper
      ZNC: '#7F8C8D', // Zinc
    };
    return colors[metalSymbol] || '#FFD700';
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change, changePercent) => {
    if (change === undefined || changePercent === undefined) {
      return { text: 'N/A', color: '#ccc' };
    }
    
    const isPositive = change >= 0;
    const color = isPositive ? '#4CAF50' : '#F44336';
    const symbol = isPositive ? '+' : '';
    
    return {
      text: `${symbol}${change.toFixed(2)} (${symbol}${changePercent.toFixed(2)}%)`,
      color,
    };
  };

  const renderHistoricalData = () => {
    if (!historicalData?.rates) return null;

    const rates = Object.entries(historicalData.rates)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-5); // Show last 5 days

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent History</Text>
        {rates.map(([date, rateData]) => {
          const rate = rateData[`USD${metalSymbol}`];
          return (
            <View key={date} style={styles.historyItem}>
              <Text style={styles.historyDate}>
                {moment(date).format('MMM DD')}
              </Text>
              <Text style={styles.historyPrice}>
                {formatPrice(rate)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text={`Loading ${metalName} data...`} />
      </SafeAreaView>
    );
  }

  if (error && !metalData) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState error={error} onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  const metalColor = getMetalColor(metalSymbol);
  const changeInfo = formatChange(metalData?.change, metalData?.changePercent);

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
          <View style={styles.metalInfo}>
            <View style={[styles.metalIcon, { backgroundColor: metalColor }]}>
              <Text style={styles.metalSymbol}>{metalSymbol}</Text>
            </View>
            <View style={styles.metalDetails}>
              <Text style={styles.metalName}>{metalName}</Text>
              <Text style={styles.currency}>USD per troy ounce</Text>
            </View>
          </View>
        </View>

        {/* Current Price */}
        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>
            {formatPrice(metalData?.price)}
          </Text>
          <View style={styles.changeContainer}>
            <Text style={[styles.changeText, { color: changeInfo.color }]}>
              {changeInfo.text}
            </Text>
          </View>
          {metalData?.lastUpdated && (
            <Text style={styles.timestamp}>
              Last updated: {moment(metalData.lastUpdated).format('MMM DD, HH:mm')}
            </Text>
          )}
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Current Price</Text>
              <Text style={styles.detailValue}>
                {formatPrice(metalData?.price)}
              </Text>
            </View>
            {metalData?.previousPrice && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Previous Close</Text>
                <Text style={styles.detailValue}>
                  {formatPrice(metalData.previousPrice)}
                </Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Change</Text>
              <Text style={[styles.detailValue, { color: changeInfo.color }]}>
                {changeInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Currency Conversion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Currency Conversion</Text>
          <View style={styles.conversionButtons}>
            {['EUR', 'GBP', 'JPY', 'CAD'].map((currency) => (
              <TouchableOpacity
                key={currency}
                style={[
                  styles.currencyButton,
                  selectedCurrency === currency && styles.selectedCurrencyButton,
                ]}
                onPress={() => fetchConvertedPrice(currency)}>
                <Text style={[
                  styles.currencyButtonText,
                  selectedCurrency === currency && styles.selectedCurrencyButtonText,
                ]}>
                  {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {showConversion && convertedPrice && (
            <View style={styles.conversionResult}>
              <Text style={styles.conversionText}>
                {convertedPrice.priceConverted.toFixed(2)} {selectedCurrency}
              </Text>
            </View>
          )}
        </View>

        {/* Historical Data */}
        {renderHistoricalData()}

        {/* Market Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market Information</Text>
          <Text style={styles.marketInfo}>
            Prices are sourced from multiple market data providers and may not reflect 
            actual trading prices. This information is for educational purposes only 
            and should not be used for investment decisions.
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
  metalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  metalSymbol: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metalDetails: {
    flex: 1,
  },
  metalName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  currency: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 4,
  },
  priceSection: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  currentPrice: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  changeContainer: {
    marginBottom: 8,
  },
  changeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  conversionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  currencyButton: {
    backgroundColor: '#3a3a3a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedCurrencyButton: {
    backgroundColor: '#FFD700',
  },
  currencyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedCurrencyButtonText: {
    color: '#1a1a1a',
  },
  conversionResult: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  conversionText: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  historyDate: {
    color: '#ccc',
    fontSize: 14,
  },
  historyPrice: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  marketInfo: {
    color: '#999',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default MetalDetailScreen;
