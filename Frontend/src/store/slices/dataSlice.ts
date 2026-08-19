import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Plan {
  _id: string;
  planName: string;
  price: number;
  dailyIncome: number;
  duration: number;
  totalIncome: number;
  hashRate: string;
  qrCode: string;   // per-plan QR code (base64 or URL)
  image: string;
}

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: string;
  status: string;
  balance: number;
  joinDate: string;
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

export interface Transaction {
  id: string;
  user: string;
  userId: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  screenshot?: string;
  utrNumber?: string;
}

export interface SystemSettings {
  upiId: string;
  qrCodeUrl: string;
  accountName?: string;
  paymentInstructions?: string;
}

interface DataState {
  plans: Plan[];
  users: User[];
  transactions: Transaction[];
  settings: SystemSettings;
}

const initialState: DataState = {
  plans:        [],
  users:        [],       // removed hardcoded mock data — fetched from API
  transactions: [],       // removed hardcoded mock data — fetched from API
  settings: {
    upiId:      '',
    qrCodeUrl:  '',
  },
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setPlans: (state, action: PayloadAction<Plan[]>) => {
      state.plans = action.payload;
    },
    addPlan: (state, action: PayloadAction<Plan>) => {
      state.plans.unshift(action.payload);
    },
    updatePlan: (state, action: PayloadAction<Plan>) => {
      const index = state.plans.findIndex(p => p._id === action.payload._id);
      if (index !== -1) state.plans[index] = action.payload;
    },
    deletePlan: (state, action: PayloadAction<string>) => {
      state.plans = state.plans.filter(p => p._id !== action.payload);
    },
    updateUserStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const user = state.users.find(u => u.id === action.payload.id);
      if (user) user.status = action.payload.status;
    },
    updateUserRole: (state, action: PayloadAction<{ id: string; role: string }>) => {
      const user = state.users.find(u => u.id === action.payload.id);
      if (user) user.role = action.payload.role;
    },
    updateSettings: (state, action: PayloadAction<SystemSettings>) => {
      state.settings = action.payload;
    },
    updateTransactionStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const tx = state.transactions.find(t => t.id === action.payload.id);
      if (tx && tx.status !== action.payload.status) {
        const oldStatus = tx.status;
        tx.status = action.payload.status;
        const user = state.users.find(u => u.id === tx.userId);
        if (user) {
          if (tx.type === 'deposit') {
            if (action.payload.status === 'completed' && oldStatus !== 'completed') user.balance += tx.amount;
            else if (oldStatus === 'completed' && action.payload.status !== 'completed') user.balance -= tx.amount;
          } else if (tx.type === 'withdrawal') {
            if (action.payload.status === 'rejected' && oldStatus !== 'rejected') user.balance += tx.amount;
            else if (oldStatus === 'rejected' && action.payload.status !== 'rejected') user.balance -= tx.amount;
          }
        }
      }
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    syncUserBalance: (state, action: PayloadAction<{ id: string; balance: number }>) => {
      const user = state.users.find(u => u.id === action.payload.id || u.id === action.payload.id.replace('user_', ''));
      if (user) user.balance = action.payload.balance;
    },
    syncUserData: (state, action: PayloadAction<any>) => {
      const authUser = action.payload;
      const user = state.users.find(u => u.id === authUser._id);
      if (user) {
        user.balance         = authUser.walletBalance   ?? user.balance;
        user.paymentDetails  = authUser.paymentDetails  ?? user.paymentDetails;
        user.checkInState    = authUser.checkInState    ?? user.checkInState;
        user.purchasedPlans  = authUser.purchasedPlans  ?? user.purchasedPlans;
      }
    },
  },
});

export const {
  updateSettings, setPlans, addPlan, updatePlan, deletePlan,
  updateUserStatus, updateUserRole, updateTransactionStatus,
  addTransaction, setTransactions, addUser, setUsers,
  syncUserBalance, syncUserData,
} = dataSlice.actions;

export default dataSlice.reducer;
