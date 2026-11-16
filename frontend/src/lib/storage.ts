import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Shared persistence adapter for every store that survives app restarts. */
export const persistStorage = createJSONStorage(() => AsyncStorage);
