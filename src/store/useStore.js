import { create } from 'zustand';

// Helper to safely parse stored user from localStorage
const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('antigravity_user');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Error loading stored user', e);
    return null;
  }
};

const useStore = create((set, get) => ({
  // AUTH SLICE
  user: getInitialUser(),
  login: (userData) => {
    // userData contains { token, user: { userId, email } }
    const mappedUser = {
      userId: userData.user.userId,
      email: userData.user.email,
      token: userData.token
    };
    localStorage.setItem('antigravity_user', JSON.stringify(mappedUser));
    set({ user: mappedUser });
  },
  logout: () => {
    localStorage.removeItem('antigravity_user');
    set({ user: null, items: [], notifications: [], unreadCount: 0 });
  },

  // ITEMS SLICE
  items: [],
  setItems: (arr) => set({ items: arr }),
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
  updateItem: (id, fields) => set((state) => ({
    items: state.items.map((item) => 
      item._id === id ? { ...item, ...fields } : item
    )
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item._id !== id)
  })),

  // NOTIFICATIONS SLICE
  notifications: [],
  unreadCount: 0,
  setNotifications: (arr) => {
    const unread = arr.filter(n => !n.isRead).length;
    set({ notifications: arr, unreadCount: unread });
  },
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0
  })),

  // UI SLICES
  isAddModalOpen: false,
  initialAddUrl: '',
  openAddModal: (url = '') => set({ isAddModalOpen: true, initialAddUrl: url }),
  closeAddModal: () => set({ isAddModalOpen: false, initialAddUrl: '' }),
  
  graphItemId: null,
  openGraph: (id) => set({ graphItemId: id }),
  closeGraph: () => set({ graphItemId: null }),

  isCompareModalOpen: false,
  openCompareModal: () => set({ isCompareModalOpen: true }),
  closeCompareModal: () => set({ isCompareModalOpen: false }),

  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  // DIALOG SLICES
  dialog: null,
  showConfirm: (title, message, onConfirm, onCancel) => set({
    dialog: { title, message, type: 'confirm', onConfirm, onCancel }
  }),
  showAlert: (title, message) => set({
    dialog: { title, message, type: 'alert' }
  }),
  closeDialog: () => set({ dialog: null }),

  // COMPARISONS SLICE
  comparisonProducts: [],
  setComparisonProducts: (arr) => set({ comparisonProducts: arr }),
  addComparisonProduct: (product) => set((state) => ({ comparisonProducts: [product, ...state.comparisonProducts] })),
  updateComparisonProduct: (id, product) => set((state) => ({
    comparisonProducts: state.comparisonProducts.map(p => p._id === id ? product : p)
  })),
  removeComparisonProduct: (id) => set((state) => ({
    comparisonProducts: state.comparisonProducts.filter(p => p._id !== id)
  })),

  // CART SLICE
  cart: (() => {
    try {
      const stored = localStorage.getItem('antigravity_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  })(),
  addToCart: (item) => {
    const currentCart = get().cart;
    const exists = currentCart.some(i => i.productUrl === item.productUrl);
    if (!exists) {
      const updated = [...currentCart, { ...item, id: item.site + '_' + Date.now() }];
      localStorage.setItem('antigravity_cart', JSON.stringify(updated));
      set({ cart: updated });
    }
  },
  removeFromCart: (id) => {
    const updated = get().cart.filter(i => i.id !== id);
    localStorage.setItem('antigravity_cart', JSON.stringify(updated));
    set({ cart: updated });
  },
  clearCart: () => {
    localStorage.setItem('antigravity_cart', JSON.stringify([]));
    set({ cart: [] });
  },

  // SAVED PRODUCTS (HOME) SLICE
  savedProducts: (() => {
    try {
      const stored = localStorage.getItem('antigravity_saved_products');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  })(),
  saveProduct: (product) => {
    const currentSaved = get().savedProducts;
    const exists = currentSaved.some(p => p.productUrl === product.productUrl);
    if (!exists) {
      const updated = [...currentSaved, { ...product, id: product.site + '_' + Date.now(), savedAt: new Date().toISOString() }];
      localStorage.setItem('antigravity_saved_products', JSON.stringify(updated));
      set({ savedProducts: updated });
    }
  },
  removeSavedProduct: (id) => {
    const updated = get().savedProducts.filter(p => p.id !== id);
    localStorage.setItem('antigravity_saved_products', JSON.stringify(updated));
    set({ savedProducts: updated });
  }
}));

export default useStore;
