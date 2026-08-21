import { useState, useEffect } from 'react';

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  category: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
  color: string;
}

export interface Holding {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  shares: number;
  type: 'crypto' | 'stock';
}

// Global state container
let balance = 12450.80;
let transactions: Transaction[] = [
  { id: '1', title: 'Salary Credit', category: 'Income', amount: 4500, type: 'income', date: 'Today' },
  { id: '2', title: 'Grocery Supermarket', category: 'Food', amount: 124.50, type: 'expense', date: 'Yesterday' },
  { id: '3', title: 'Netflix Subscription', category: 'Entertainment', amount: 15.99, type: 'expense', date: 'Aug 18' },
  { id: '4', title: 'Coffee Brew Coffee', category: 'Food', amount: 6.80, type: 'expense', date: 'Aug 17' },
  { id: '5', title: 'Gym Membership', category: 'Fitness', amount: 50.00, type: 'expense', date: 'Aug 15' },
];

let savingsGoals: SavingsGoal[] = [
  { id: '1', title: 'Tesla Model Y', target: 50000, current: 15000, category: 'Automobile' },
  { id: '2', title: 'Europe Summer Trip', target: 8000, current: 4800, category: 'Travel' },
  { id: '3', title: 'Emergency Fund', target: 10000, current: 7500, category: 'Savings' },
];

let budgets: Budget[] = [
  { category: 'Food', limit: 500, spent: 320, color: '#FF9500' },
  { category: 'Shopping', limit: 800, spent: 450, color: '#FF2D55' },
  { category: 'Entertainment', limit: 300, spent: 180, color: '#AF52DE' },
  { category: 'Travel', limit: 600, spent: 550, color: '#007AFF' },
];

let holdings: Holding[] = [
  { id: '1', name: 'Bitcoin', symbol: 'BTC', price: 92430.50, change: 3.42, shares: 0.05, type: 'crypto' },
  { id: '2', name: 'Ethereum', symbol: 'ETH', price: 3120.15, change: -1.25, shares: 0.8, type: 'crypto' },
  { id: '3', name: 'Apple Inc.', symbol: 'AAPL', price: 182.40, change: 0.85, shares: 12, type: 'stock' },
  { id: '4', name: 'Tesla Inc.', symbol: 'TSLA', price: 218.30, change: -4.12, shares: 5, type: 'stock' },
  { id: '5', name: 'NVIDIA Corp.', symbol: 'NVDA', price: 875.12, change: 6.88, shares: 10, type: 'stock' },
];

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(l => l());
}

export function useFinanceData() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick(t => t + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const addTransaction = (title: string, category: string, amount: number, type: 'income' | 'expense') => {
    const newTx: Transaction = {
      id: Date.now().toString(),
      title,
      category,
      amount,
      type,
      date: 'Today',
    };
    transactions = [newTx, ...transactions];
    if (type === 'income') {
      balance += amount;
    } else {
      balance -= amount;
      // also update budget if exists
      const budgetIndex = budgets.findIndex(b => b.category.toLowerCase() === category.toLowerCase());
      if (budgetIndex !== -1) {
        budgets = budgets.map((b, idx) => idx === budgetIndex ? { ...b, spent: b.spent + amount } : b);
      }
    }
    notify();
  };

  const addMoneyToGoal = (goalId: string, amount: number) => {
    if (balance >= amount) {
      balance -= amount;
      savingsGoals = savingsGoals.map(g => {
        if (g.id === goalId) {
          const newCurrent = Math.min(g.target, g.current + amount);
          // Add as expense to transaction log
          const newTx: Transaction = {
            id: Date.now().toString(),
            title: `Goal Fund: ${g.title}`,
            category: 'Savings',
            amount,
            type: 'expense',
            date: 'Today',
          };
          transactions = [newTx, ...transactions];
          return { ...g, current: newCurrent };
        }
        return g;
      });
      notify();
      return true;
    }
    return false;
  };

  const updateBudgetLimit = (category: string, newLimit: number) => {
    budgets = budgets.map(b => b.category === category ? { ...b, limit: newLimit } : b);
    notify();
  };

  const buyAsset = (holdingId: string, sharesCount: number) => {
    const holding = holdings.find(h => h.id === holdingId);
    if (!holding) return false;
    const cost = holding.price * sharesCount;
    if (balance >= cost) {
      balance -= cost;
      holdings = holdings.map(h => h.id === holdingId ? { ...h, shares: h.shares + sharesCount } : h);
      addTransaction(`Bought ${sharesCount.toFixed(2)} ${holding.symbol}`, 'Investments', cost, 'expense');
      notify();
      return true;
    }
    return false;
  };

  const sellAsset = (holdingId: string, sharesCount: number) => {
    const holding = holdings.find(h => h.id === holdingId);
    if (!holding || holding.shares < sharesCount) return false;
    const proceeds = holding.price * sharesCount;
    balance += proceeds;
    holdings = holdings.map(h => h.id === holdingId ? { ...h, shares: h.shares - sharesCount } : h);
    addTransaction(`Sold ${sharesCount.toFixed(2)} ${holding.symbol}`, 'Investments', proceeds, 'income');
    notify();
    return true;
  };

  const resetAllData = () => {
    balance = 12450.80;
    transactions = [
      { id: '1', title: 'Salary Credit', category: 'Income', amount: 4500, type: 'income', date: 'Today' },
      { id: '2', title: 'Grocery Supermarket', category: 'Food', amount: 124.50, type: 'expense', date: 'Yesterday' },
      { id: '3', title: 'Netflix Subscription', category: 'Entertainment', amount: 15.99, type: 'expense', date: 'Aug 18' },
      { id: '4', title: 'Coffee Brew Coffee', category: 'Food', amount: 6.80, type: 'expense', date: 'Aug 17' },
      { id: '5', title: 'Gym Membership', category: 'Fitness', amount: 50.00, type: 'expense', date: 'Aug 15' },
    ];
    savingsGoals = [
      { id: '1', title: 'Tesla Model Y', target: 50000, current: 15000, category: 'Automobile' },
      { id: '2', title: 'Europe Summer Trip', target: 8000, current: 4800, category: 'Travel' },
      { id: '3', title: 'Emergency Fund', target: 10000, current: 7500, category: 'Savings' },
    ];
    budgets = [
      { category: 'Food', limit: 500, spent: 320, color: '#FF9500' },
      { category: 'Shopping', limit: 800, spent: 450, color: '#FF2D55' },
      { category: 'Entertainment', limit: 300, spent: 180, color: '#AF52DE' },
      { category: 'Travel', limit: 600, spent: 550, color: '#007AFF' },
    ];
    holdings = [
      { id: '1', name: 'Bitcoin', symbol: 'BTC', price: 92430.50, change: 3.42, shares: 0.05, type: 'crypto' },
      { id: '2', name: 'Ethereum', symbol: 'ETH', price: 3120.15, change: -1.25, shares: 0.8, type: 'crypto' },
      { id: '3', name: 'Apple Inc.', symbol: 'AAPL', price: 182.40, change: 0.85, shares: 12, type: 'stock' },
      { id: '4', name: 'Tesla Inc.', symbol: 'TSLA', price: 218.30, change: -4.12, shares: 5, type: 'stock' },
      { id: '5', name: 'NVIDIA Corp.', symbol: 'NVDA', price: 875.12, change: 6.88, shares: 10, type: 'stock' },
    ];
    notify();
  };

  // Mock live price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      holdings = holdings.map(h => {
        const factor = (Math.random() - 0.5) * 0.02; // +- 1%
        const newPrice = Math.max(0.1, h.price * (1 + factor));
        const newChange = h.change + (factor * 100);
        return {
          ...h,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(newChange.toFixed(2))
        };
      });
      notify();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  return {
    balance,
    transactions,
    savingsGoals,
    budgets,
    holdings,
    addTransaction,
    addMoneyToGoal,
    updateBudgetLimit,
    buyAsset,
    sellAsset,
    resetAllData
  };
}
