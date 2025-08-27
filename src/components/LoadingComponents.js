import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';

// Generic Loading Spinner
export const LoadingSpinner = ({size = 'large', color = '#FFD700', text}) => {
  return (
    <View style={styles.spinnerContainer}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.loadingText}>{text}</Text>}
    </View>
  );
};

// Skeleton Loading Component
export const SkeletonLoader = ({width, height, borderRadius = 4}) => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E1E9EE', '#F2F8FC'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
      ]}
    />
  );
};

// Metal Card Skeleton
export const MetalCardSkeleton = () => {
  return (
    <View style={styles.metalCardSkeleton}>
      <View style={styles.skeletonHeader}>
        <SkeletonLoader width={60} height={20} />
        <SkeletonLoader width={40} height={16} />
      </View>
      <View style={styles.skeletonPrice}>
        <SkeletonLoader width={100} height={24} />
        <SkeletonLoader width={80} height={16} />
      </View>
      <View style={styles.skeletonFooter}>
        <SkeletonLoader width={120} height={14} />
      </View>
    </View>
  );
};

// Individual Metal Loader with specific styling
export const MetalLoader = ({metalName, color = '#FFD700'}) => {
  const spinValue = new Animated.Value(0);

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();

    return () => animation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.metalLoaderContainer}>
      <Animated.View
        style={[
          styles.metalLoaderIcon,
          {
            borderTopColor: color,
            transform: [{rotate: spin}],
          },
        ]}
      />
      <Text style={styles.metalLoaderText}>Loading {metalName}...</Text>
    </View>
  );
};

// Dashboard Loading Screen
export const DashboardLoader = () => {
  return (
    <View style={styles.dashboardLoader}>
      <Text style={styles.dashboardLoaderTitle}>Loading Metal Prices</Text>
      <View style={styles.metalLoadersGrid}>
        <MetalLoader metalName="Gold" color="#FFD700" />
        <MetalLoader metalName="Silver" color="#C0C0C0" />
        <MetalLoader metalName="Platinum" color="#E5E4E2" />
        <MetalLoader metalName="Palladium" color="#CED0DD" />
        <MetalLoader metalName="Copper" color="#B87333" />
        <MetalLoader metalName="Zinc" color="#7F8C8D" />
      </View>
    </View>
  );
};

// Error State Component
export const ErrorState = ({error, onRetry}) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorMessage}>
        {error?.message || 'Unable to load metal prices'}
      </Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Pull to Refresh Loader
export const PullToRefreshLoader = () => {
  return (
    <View style={styles.pullToRefreshContainer}>
      <ActivityIndicator size="small" color="#FFD700" />
      <Text style={styles.pullToRefreshText}>Updating prices...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
  metalCardSkeleton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    minHeight: 120,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  skeletonPrice: {
    marginBottom: 12,
  },
  skeletonFooter: {
    marginTop: 'auto',
  },
  metalLoaderContainer: {
    alignItems: 'center',
    padding: 16,
    margin: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    minWidth: 120,
  },
  metalLoaderIcon: {
    width: 40,
    height: 40,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#FFD700',
    borderRadius: 20,
    marginBottom: 8,
  },
  metalLoaderText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  dashboardLoader: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    justifyContent: 'center',
  },
  dashboardLoaderTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  metalLoadersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pullToRefreshContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  pullToRefreshText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default {
  LoadingSpinner,
  SkeletonLoader,
  MetalCardSkeleton,
  MetalLoader,
  DashboardLoader,
  ErrorState,
  PullToRefreshLoader,
};
