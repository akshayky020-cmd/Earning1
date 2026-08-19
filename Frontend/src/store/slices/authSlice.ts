import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  role: string;
  walletBalance?: number;
  referralCode?: string;
  referredBy?: string;
  paymentDetails?: {
    accountName: string;
    accountNo: string;
    ifsc: string;
    upiId: string;
  };
  checkInState?: {
    streak: number;
    totalDays: number;
    totalEarned: number;
    lastCheckInDate: string | null;
    history: Array<{ id: string; date: string; amount: number }>;
  };
  purchasedPlans?: Array<{
    id: string;
    planId: string;
    planName: string;
    price: number;
    dailyIncome: number;
    duration: number;
    purchaseDate: string;
    activationDate?: string;
    expiryDate: string;
    paymentId?: string;
    transactionId?: string;
    status: 'active' | 'expired' | 'pending' | 'cancelled';
  }>;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const getStoredUser = (): User | null => {
  try {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
};

const initialUser = getStoredUser();
const initialToken = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!(initialUser && initialToken),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<any>) => {
      const token = action.payload.accessToken || action.payload.token || '';
      const user = { ...action.payload };
      delete (user as any).token;
      delete (user as any).accessToken;
      delete (user as any).refreshToken;
      
      state.user = user;
      state.isAuthenticated = true;
      
      if (token) {
        sessionStorage.setItem('token', token);
      }
      sessionStorage.setItem('user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('appState');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        sessionStorage.setItem('user', JSON.stringify(state.user));
      }
    },
    syncFromStorage: (state) => {
      try {
        const token = sessionStorage.getItem('token');
        const user = sessionStorage.getItem('user');
        if (token && user) {
          state.user = JSON.parse(user);
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      } catch {
        state.user = null;
        state.isAuthenticated = false;
      }
    }
  },
});

export const { setCredentials, logout, updateUser, syncFromStorage } = authSlice.actions;
export default authSlice.reducer;

