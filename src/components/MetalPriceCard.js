import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import moment from 'moment';

const MetalPriceCard = ({
  metalData,
  onPress,
  style,
  showDetails = true,
}) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return moment(timestamp).format('MMM DD, HH:mm');
  };

  const metalColor = getMetalColor(metalData?.metal);
  const changeInfo = formatChange(metalData?.change, metalData?.changePercent);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.card,
          { transform: [{ scale: scaleValue }] },
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.metalInfo}>
            <View style={[styles.metalIcon, { backgroundColor: metalColor }]}>
              <Text style={styles.metalSymbol}>{metalData?.metal}</Text>
            </View>
            <View style={styles.metalDetails}>
              <Text style={styles.metalName}>{metalData?.metalName}</Text>
              <Text style={styles.currency}>{metalData?.currency || 'USD'}</Text>
            </View>
          </View>
          {showDetails && (
            <View style={styles.timestampContainer}>
              <Text style={styles.timestamp}>
                {formatTimestamp(metalData?.lastUpdated)}
              </Text>
            </View>
          )}
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>
            {formatPrice(metalData?.price)}
          </Text>
          <View style={styles.changeContainer}>
            <Text style={[styles.changeText, { color: changeInfo.color }]}>
              {changeInfo.text}
            </Text>
          </View>
        </View>

        {/* Additional Details */}
        {showDetails && metalData?.previousPrice && (
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Previous Close:</Text>
              <Text style={styles.detailValue}>
                {formatPrice(metalData.previousPrice)}
              </Text>
            </View>
          </View>
        )}

        {/* Status Indicator */}
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: metalColor }]} />
          <Text style={styles.statusText}>Live</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  metalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metalSymbol: {
    color: '#1a1a1a',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metalDetails: {
    flex: 1,
  },
  metalName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  currency: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  timestampContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    color: '#999',
    fontSize: 11,
  },
  priceSection: {
    marginBottom: 12,
  },
  currentPrice: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsSection: {
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    paddingTop: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    color: '#ccc',
    fontSize: 12,
  },
  detailValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#999',
    fontSize: 10,
    textTransform: 'uppercase',
  },
});

export default MetalPriceCard;
