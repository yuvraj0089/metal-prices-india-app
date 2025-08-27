import React from 'react';
import {AppState} from 'react-native';

/**
 * Manages periodic updates for metal prices
 */
export class UpdateManager {
  constructor() {
    this.updateInterval = null;
    this.updateCallback = null;
    this.isActive = false;
    this.appStateSubscription = null;
    this.updateFrequency = 60000; // 1 minute default
  }

  /**
   * Start periodic updates
   * @param {Function} callback - Function to call for updates
   * @param {number} frequency - Update frequency in milliseconds
   */
  startPeriodicUpdates(callback, frequency = 60000) {
    this.updateCallback = callback;
    this.updateFrequency = frequency;
    this.isActive = true;

    // Set up app state listener
    this.setupAppStateListener();

    // Start the interval if app is active
    if (AppState.currentState === 'active') {
      this.startInterval();
    }
  }

  /**
   * Stop periodic updates
   */
  stopPeriodicUpdates() {
    this.isActive = false;
    this.clearInterval();
    this.removeAppStateListener();
  }

  /**
   * Setup app state listener to pause/resume updates
   */
  setupAppStateListener() {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );
  }

  /**
   * Remove app state listener
   */
  removeAppStateListener() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }

  /**
   * Handle app state changes
   */
  handleAppStateChange(nextAppState) {
    if (nextAppState === 'active' && this.isActive) {
      // App became active, start updates
      this.startInterval();
      // Trigger immediate update when app becomes active
      if (this.updateCallback) {
        this.updateCallback();
      }
    } else {
      // App became inactive, stop updates
      this.clearInterval();
    }
  }

  /**
   * Start the update interval
   */
  startInterval() {
    this.clearInterval(); // Clear any existing interval
    this.updateInterval = setInterval(() => {
      if (this.updateCallback && this.isActive) {
        this.updateCallback();
      }
    }, this.updateFrequency);
  }

  /**
   * Clear the update interval
   */
  clearInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Change update frequency
   */
  setUpdateFrequency(frequency) {
    this.updateFrequency = frequency;
    if (this.isActive && AppState.currentState === 'active') {
      this.startInterval(); // Restart with new frequency
    }
  }

  /**
   * Trigger manual update
   */
  triggerUpdate() {
    if (this.updateCallback && this.isActive) {
      this.updateCallback();
    }
  }

  /**
   * Check if updates are currently active
   */
  isUpdating() {
    return this.isActive && this.updateInterval !== null;
  }
}

/**
 * Smart update scheduler that adjusts frequency based on user activity
 */
export class SmartUpdateScheduler extends UpdateManager {
  constructor() {
    super();
    this.lastUserInteraction = Date.now();
    this.baseFrequency = 60000; // 1 minute
    this.maxFrequency = 300000; // 5 minutes
    this.interactionTimeout = 120000; // 2 minutes
  }

  /**
   * Record user interaction to adjust update frequency
   */
  recordUserInteraction() {
    this.lastUserInteraction = Date.now();
    this.adjustUpdateFrequency();
  }

  /**
   * Adjust update frequency based on user activity
   */
  adjustUpdateFrequency() {
    const timeSinceInteraction = Date.now() - this.lastUserInteraction;
    
    let newFrequency;
    if (timeSinceInteraction < this.interactionTimeout) {
      // User is active, update more frequently
      newFrequency = this.baseFrequency;
    } else {
      // User is inactive, update less frequently
      newFrequency = Math.min(
        this.maxFrequency,
        this.baseFrequency + timeSinceInteraction / 2
      );
    }

    if (newFrequency !== this.updateFrequency) {
      this.setUpdateFrequency(newFrequency);
    }
  }

  /**
   * Override start method to include smart scheduling
   */
  startPeriodicUpdates(callback, frequency = 60000) {
    this.baseFrequency = frequency;
    super.startPeriodicUpdates(callback, frequency);
    
    // Set up periodic frequency adjustment
    this.frequencyAdjustmentInterval = setInterval(() => {
      this.adjustUpdateFrequency();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Override stop method to clean up smart scheduling
   */
  stopPeriodicUpdates() {
    super.stopPeriodicUpdates();
    
    if (this.frequencyAdjustmentInterval) {
      clearInterval(this.frequencyAdjustmentInterval);
      this.frequencyAdjustmentInterval = null;
    }
  }
}

/**
 * Hook for using update manager in React components
 */
export const useUpdateManager = (updateCallback, options = {}) => {
  const {
    frequency = 60000,
    smart = true,
    autoStart = true,
  } = options;

  const [updateManager] = React.useState(() => 
    smart ? new SmartUpdateScheduler() : new UpdateManager()
  );

  React.useEffect(() => {
    if (autoStart && updateCallback) {
      updateManager.startPeriodicUpdates(updateCallback, frequency);
    }

    return () => {
      updateManager.stopPeriodicUpdates();
    };
  }, [updateManager, updateCallback, frequency, autoStart]);

  const recordInteraction = React.useCallback(() => {
    if (smart && updateManager.recordUserInteraction) {
      updateManager.recordUserInteraction();
    }
  }, [updateManager, smart]);

  return {
    updateManager,
    recordInteraction,
    triggerUpdate: () => updateManager.triggerUpdate(),
    isUpdating: () => updateManager.isUpdating(),
    setFrequency: (freq) => updateManager.setUpdateFrequency(freq),
  };
};

export default {
  UpdateManager,
  SmartUpdateScheduler,
  useUpdateManager,
};
