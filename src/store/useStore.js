import { create } from 'zustand';

// Helper to safely parse stored user from localStorage
const getInitialUser = () => {
  try {
    const stored = localStorage.getItem('pricedekho_user');
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    console.error('Error loading stored user', e);
    return null;
  }
};

// Helper to load scoped user cart from localStorage
const getInitialCart = (userId) => {
  if (!userId) return [];
  try {
    const stored = localStorage.getItem(`pricedekho_cart_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const initialUser = getInitialUser();

const useStore = create((set, get) => ({
  // AUTH SLICE
  user: initialUser,
  login: (userData) => {
    // userData contains { token, user: { userId, email, name, phone, emailNotifications, role } }
    const mappedUser = {
      userId: userData.user.userId,
      email: userData.user.email,
      name: userData.user.name || '',
      phone: userData.user.phone || '',
      emailNotifications: userData.user.emailNotifications !== false,
      role: userData.user.role || 'user',
      token: userData.token
    };
    localStorage.setItem('pricedekho_user', JSON.stringify(mappedUser));
    
    // Scoped cart load on login
    const userCart = getInitialCart(mappedUser.userId);
    set({ user: mappedUser, cart: userCart });
  },
  updateUser: (fields) => {
    const currentUser = get().user;
    if (currentUser) {
      const updated = { ...currentUser, ...fields };
      localStorage.setItem('pricedekho_user', JSON.stringify(updated));
      set({ user: updated });
    }
  },
  logout: () => {
    localStorage.removeItem('pricedekho_user');
    set({ user: null, items: [], notifications: [], unreadCount: 0, cart: [] });
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
  cart: initialUser ? getInitialCart(initialUser.userId) : [],
  addToCart: (item) => {
    const user = get().user;
    const userId = user ? user.userId : 'guest';
    const currentCart = get().cart;
    const exists = currentCart.some(i => i.productUrl === item.productUrl);
    if (!exists) {
      const updated = [...currentCart, { ...item, id: item.site + '_' + Date.now() }];
      localStorage.setItem(`pricedekho_cart_${userId}`, JSON.stringify(updated));
      set({ cart: updated });
    }
  },
  removeFromCart: (id) => {
    const user = get().user;
    const userId = user ? user.userId : 'guest';
    const updated = get().cart.filter(i => i.id !== id);
    localStorage.setItem(`pricedekho_cart_${userId}`, JSON.stringify(updated));
    set({ cart: updated });
  },
  clearCart: () => {
    const user = get().user;
    const userId = user ? user.userId : 'guest';
    localStorage.setItem(`pricedekho_cart_${userId}`, JSON.stringify([]));
    set({ cart: [] });
  },

  // SAVED PRODUCTS (HOME) SLICE
  savedProducts: [],
  setSavedProducts: (arr) => set({ savedProducts: arr }),
  saveProduct: (product) => set((state) => ({
    savedProducts: [product, ...state.savedProducts]
  })),
  removeSavedProduct: (id) => set((state) => ({
    savedProducts: state.savedProducts.filter(p => p._id !== id)
  }))
}));

export default useStore;
