import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import {CacheManager} from '../utils/errorHandler';

const SettingsScreen = () => {
  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached metal price data. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await CacheManager.clearCache();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Metal Prices App',
      'This app provides real-time metal prices for gold, silver, platinum, palladium, copper, and zinc.\n\nData is sourced from MetalpriceAPI and is for informational purposes only.',
      [{text: 'OK'}]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Support',
      'For support and feedback, please contact us.',
      [{text: 'OK'}]
    );
  };

  const SettingItem = ({title, subtitle, onPress, color = '#fff'}) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, {color}]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.settingArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Cache</Text>
          <SettingItem
            title="Clear Cache"
            subtitle="Remove cached metal price data"
            onPress={handleClearCache}
            color="#F44336"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information</Text>
          <SettingItem
            title="About"
            subtitle="App information and data sources"
            onPress={handleAbout}
          />
          <SettingItem
            title="Support"
            subtitle="Get help and provide feedback"
            onPress={handleSupport}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Metal Prices App v1.0.0
          </Text>
          <Text style={styles.footerText}>
            Data provided by MetalpriceAPI
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 10,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: '#999',
    fontSize: 12,
  },
  settingArrow: {
    color: '#666',
    fontSize: 20,
    fontWeight: '300',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default SettingsScreen;
