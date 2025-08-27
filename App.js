import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const { width, height } = Dimensions.get('window');
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon Component
const TabIcon = ({ name, focused }) => {
  const icons = {
    'Dashboard': focused ? '📊' : '��',
    'Settings': focused ? '⚙️' : '🔧',
    'About': focused ? 'ℹ️' : '💡'
  };
  
  return (
    <Text style={{ 
      fontSize: 20, 
      color: focused ? '#FFD700' : '#888',
      transform: [{ scale: focused ? 1.1 : 1 }]
    }}>
      {icons[name]}
    </Text>
  );
};

// Animated Metal Card Component
const MetalCard = ({ metalName, price, change, unit, onPress, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getGradientColors = (metalName) => {
    if (metalName.includes('Gold')) return ['#FFD700', '#FFA500', '#FF8C00'];
    if (metalName === 'Silver') return ['#C0C0C0', '#A8A8A8', '#808080'];
    if (metalName === 'Platinum') return ['#E5E4E2', '#D3D3D3', '#A9A9A9'];
    if (metalName === 'Palladium') return ['#CED0CE', '#B8B8B8', '#A0A0A0'];
    return ['#4A90E2', '#357ABD', '#2E6DA4'];
  };

  const getMetalIcon = (metalName) => {
    if (metalName.includes('Gold')) return '🥇';
    if (metalName === 'Silver') return '🥈';
    if (metalName === 'Platinum') return '⚪';
    if (metalName === 'Palladium') return '⚫';
    return '💎';
  };

  return (
    <Animated.View 
      style={[
        styles.cardContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <TouchableOpacity 
        style={[styles.card, { borderLeftColor: getGradientColors(metalName)[0] }]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.metalInfo}>
            <Text style={styles.metalIcon}>{getMetalIcon(metalName)}</Text>
            <View>
              <Text style={styles.metalName}>{metalName}</Text>
              <Text style={styles.unit}>{unit}</Text>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: getGradientColors(metalName)[0] }]}>
              ₹{price.toLocaleString('en-IN')}
            </Text>
            <View style={[
              styles.changeContainer, 
              { backgroundColor: change >= 0 ? '#4CAF5020' : '#F4433620' }
            ]}>
              <Text style={[styles.change, { color: change >= 0 ? '#4CAF50' : '#F44336' }]}>
                {change >= 0 ? '↗ +' : '↘ '}{Math.abs(change).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Animated Header Component with Prominent Indian Flag
const AnimatedHeader = ({ title = "Gold & Metal Rates", subtitle = "Live Market Prices in India" }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const flagWaveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the flag
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Flag wave animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(flagWaveAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(flagWaveAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation for decorative elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const flagRotate = flagWaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '5deg'],
  });

  return (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F23" />
      
      {/* Background decorative elements */}
      <Animated.View style={[styles.decorativeCircle1, { transform: [{ rotate }] }]} />
      <Animated.View style={[styles.decorativeCircle2, { transform: [{ rotate: rotate }] }]} />
      
      <View style={styles.headerContent}>
        {/* Enhanced Indian Flag Section */}
        <Animated.View style={[
          styles.flagContainer, 
          { 
            transform: [
              { scale: pulseAnim },
              { rotate: flagRotate }
            ] 
          }
        ]}>
          <View style={styles.flagDisplay}>
            <Text style={styles.flagEmoji}>🇮🇳</Text>
            <View style={styles.flagStripes}>
              <View style={styles.saffronStripe} />
              <View style={styles.whiteStripe}>
                <Text style={styles.chakra}>⚙</Text>
              </View>
              <View style={styles.greenStripe} />
            </View>
          </View>
          <Text style={styles.flagText}>BHARAT</Text>
        </Animated.View>
        
        <Text style={styles.mainTitle}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.timestampContainer}>
          <Text style={styles.timestampLabel}>Last Updated</Text>
          <Text style={styles.timestamp}>
            {new Date().toLocaleString('en-IN', { 
              hour: '2-digit', 
              minute: '2-digit',
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Dashboard Screen
const DashboardScreen = ({ navigation }) => {
  console.log('Dashboard Screen loaded with Navigation and Enhanced Flag');
  
  const [refreshing, setRefreshing] = useState(false);
  const [metalData, setMetalData] = useState([
    { name: 'Gold 24K', price: 10259, change: 0.5, unit: 'per gram' },
    { name: 'Gold 22K', price: 9405, change: 0.4, unit: 'per gram' },
    { name: 'Gold 18K', price: 7695, change: 0.3, unit: 'per gram' },
    { name: 'Silver', price: 115, change: -0.8, unit: 'per gram' },
    { name: 'Platinum', price: 3150, change: 1.2, unit: 'per gram' },
    { name: 'Palladium', price: 3850, change: -1.1, unit: 'per gram' },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setMetalData(prevData => 
        prevData.map(metal => ({
          ...metal,
          price: Math.round(metal.price * (1 + (Math.random() - 0.5) * 0.008)),
          change: (Math.random() - 0.5) * 2
        }))
      );
      setRefreshing(false);
    }, 1000);
  };

  const handleMetalPress = (metalName, price, unit) => {
    navigation.navigate('MetalDetail', {
      metalName,
      price,
      unit,
      metalData: metalData.find(m => m.name === metalName)
    });
  };

  return (
    <View style={styles.container}>
      <AnimatedHeader />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FFD700"
            colors={['#FFD700', '#FFA500']}
          />
        }
      >
        <View style={styles.cardsContainer}>
          {metalData.map((metal, index) => (
            <MetalCard
              key={index}
              index={index}
              metalName={metal.name}
              price={metal.price}
              change={metal.change}
              unit={metal.unit}
              onPress={() => handleMetalPress(metal.name, metal.price, metal.unit)}
            />
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Text style={styles.footerIcon}>💡</Text>
          <Text style={styles.footerText}>Pull to refresh • Tap for details • Navigate using tabs</Text>
        </View>
      </View>
    </View>
  );
};

// Metal Detail Screen
const MetalDetailScreen = ({ route, navigation }) => {
  const { metalName, price, unit, metalData } = route.params;
  
  const marketInfo = {
    'Gold 24K': 'Pure 24 Carat gold rate. Highest purity for investment. Most expensive but purest form.',
    'Gold 22K': 'Standard jewelry gold in India. Most common for ornaments. Good balance of purity and durability.',
    'Gold 18K': 'Lower purity gold, more durable for daily wear jewelry. Contains more alloy metals.',
    'Silver': 'Pure silver rate. Jewelry prices include making charges and GST. Popular for ornaments.',
    'Platinum': 'Precious white metal, rarer than gold. Used in fine jewelry and industrial applications.',
    'Palladium': 'Precious metal from platinum family. Used in automotive catalysts and jewelry.'
  };

  const calculations = [
    { weight: '1 gram', price: price },
    { weight: '5 grams', price: price * 5 },
    { weight: '10 grams', price: price * 10 },
    { weight: '50 grams', price: price * 50 },
    { weight: '100 grams', price: price * 100 },
  ];

  return (
    <View style={styles.container}>
      <AnimatedHeader 
        title={`${metalName} Details`}
        subtitle="Detailed Price Information"
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.detailContainer}>
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Current Rate</Text>
            <Text style={styles.detailPrice}>₹{price.toLocaleString('en-IN')} {unit}</Text>
            <Text style={styles.detailChange}>
              {metalData?.change >= 0 ? '↗ +' : '↘ '}{Math.abs(metalData?.change || 0).toFixed(2)}%
            </Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Price Calculator</Text>
            {calculations.map((calc, index) => (
              <View key={index} style={styles.calculationRow}>
                <Text style={styles.calculationWeight}>{calc.weight}</Text>
                <Text style={styles.calculationPrice}>₹{Math.round(calc.price).toLocaleString('en-IN')}</Text>
              </View>
            ))}
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>Market Information</Text>
            <Text style={styles.detailDescription}>{marketInfo[metalName]}</Text>
            
            <View style={styles.noteContainer}>
              <Text style={styles.noteTitle}>Important Notes:</Text>
              <Text style={styles.noteText}>• Prices may vary by city and dealer</Text>
              <Text style={styles.noteText}>• GST and making charges extra for jewelry</Text>
              <Text style={styles.noteText}>• Rates updated in real-time</Text>
              <Text style={styles.noteText}>• Investment advice: Consult financial advisor</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Settings Screen
const SettingsScreen = ({ navigation }) => {
  const settingsOptions = [
    { title: 'Notifications', subtitle: 'Price alerts and updates', icon: '🔔' },
    { title: 'Currency', subtitle: 'INR (Indian Rupees)', icon: '💱' },
    { title: 'Refresh Rate', subtitle: 'Auto-refresh every 5 minutes', icon: '🔄' },
    { title: 'Theme', subtitle: 'Dark theme (Premium)', icon: '🌙' },
    { title: 'About App', subtitle: 'Version 1.0.0', icon: 'ℹ️' },
    { title: 'Support', subtitle: 'Help and feedback', icon: '💬' },
  ];

  const handleSettingPress = (title) => {
    Alert.alert(
      title,
      `${title} settings will be available in future updates. This is a demo version.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <AnimatedHeader 
        title="Settings"
        subtitle="App Configuration & Info"
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.settingsContainer}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.settingItem}
              onPress={() => handleSettingPress(option.title)}
              activeOpacity={0.7}
            >
              <Text style={styles.settingIcon}>{option.icon}</Text>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
              </View>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// About Screen
const AboutScreen = () => {
  return (
    <View style={styles.container}>
      <AnimatedHeader 
        title="About"
        subtitle="Metal Prices India App"
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.aboutContainer}>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>🇮🇳 Metal Prices India</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Your trusted companion for live metal prices in India. Get real-time rates for Gold, Silver, Platinum, and other precious metals.
            </Text>
          </View>

          <View style={styles.aboutCard}>
            <Text style={styles.aboutSectionTitle}>Features</Text>
            <Text style={styles.aboutFeature}>• Live market rates in Indian Rupees</Text>
            <Text style={styles.aboutFeature}>• Multiple gold purities (24K, 22K, 18K)</Text>
            <Text style={styles.aboutFeature}>• Price calculator for different weights</Text>
            <Text style={styles.aboutFeature}>• Beautiful animations and design</Text>
            <Text style={styles.aboutFeature}>• Pull-to-refresh functionality</Text>
          </View>

          <View style={styles.aboutCard}>
            <Text style={styles.aboutSectionTitle}>Disclaimer</Text>
            <Text style={styles.aboutDisclaimer}>
              Prices shown are for reference only and may vary by location, dealer, and market conditions. 
              Always verify current rates with authorized dealers before making any transactions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1A2E',
          borderTopColor: '#2A2A3E',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  console.log('Metal Prices App with Enhanced Indian Flag starting...');
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0F0F23' },
        }}>
        <Stack.Screen
          name="Main"
          component={TabNavigator}
        />
        <Stack.Screen
          name="MetalDetail"
          component={MetalDetailScreen}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: '#1A1A2E',
            },
            headerTintColor: '#FFD700',
            headerTitle: '',
            headerBackTitleVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  headerContainer: {
    height: height * 0.28,
    backgroundColor: '#0F0F23',
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFD70010',
    borderWidth: 2,
    borderColor: '#FFD70020',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF930010',
    borderWidth: 1,
    borderColor: '#FF930020',
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  flagContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  flagDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  flagEmoji: {
    fontSize: 50,
    marginRight: 10,
  },
  flagStripes: {
    width: 60,
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  saffronStripe: {
    flex: 1,
    backgroundColor: '#FF9933',
  },
  whiteStripe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenStripe: {
    flex: 1,
    backgroundColor: '#138808',
  },
  chakra: {
    fontSize: 12,
    color: '#000080',
  },
  flagText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 1,
  },
  subtitle: {
    color: '#FFD700',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 15,
  },
  timestampContainer: {
    alignItems: 'center',
  },
  timestampLabel: {
    color: '#888',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timestamp: {
    color: '#BBB',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metalIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  metalName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  unit: {
    color: '#AAA',
    fontSize: 12,
    fontStyle: 'italic',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  change: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#1A1A2E',
    borderTopWidth: 1,
    borderTopColor: '#2A2A3E',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  footerIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  footerText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  // Detail Screen Styles
  detailContainer: {
    padding: 20,
  },
  detailCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  detailTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailPrice: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailChange: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  calculationWeight: {
    color: '#AAA',
    fontSize: 16,
  },
  calculationPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  detailDescription: {
    color: '#CCC',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  noteContainer: {
    backgroundColor: '#0F0F23',
    padding: 15,
    borderRadius: 12,
  },
  noteTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteText: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 4,
  },
  // Settings Screen Styles
  settingsContainer: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: '#AAA',
    fontSize: 12,
  },
  settingArrow: {
    color: '#888',
    fontSize: 20,
    fontWeight: 'bold',
  },
  // About Screen Styles
  aboutContainer: {
    padding: 20,
  },
  aboutCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  aboutTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  aboutVersion: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
  },
  aboutDescription: {
    color: '#CCC',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  aboutSectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  aboutFeature: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 5,
  },
  aboutDisclaimer: {
    color: '#AAA',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
