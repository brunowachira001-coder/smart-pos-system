# Phase 10 - UX + Offline Mode
## Design Document

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (Next.js)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   POS UI     │  │   Manager    │  │   Reports    │      │
│  │   (Fast)     │  │   Dashboard  │  │   Dashboard  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  Offline Mode  │                        │
│                    │  Service       │                        │
│                    └────────────────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐              │
│         ▼                  ▼                  ▼              │
│    ┌─────────┐        ┌─────────┐       ┌─────────┐        │
│    │ Local   │        │ Service │       │ Sync    │        │
│    │ Storage │        │ Worker  │       │ Engine  │        │
│    │ (IndexDB)        │         │       │         │        │
│    └─────────┘        └─────────┘       └─────────┘        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐          ┌─────────┐         ┌─────────┐
    │ Backend │          │ Backend │         │ Backend │
    │ API     │          │ API     │         │ API     │
    └─────────┘          └─────────┘         └─────────┘
```

---

## 1. Frontend Architecture

### 1.1 Technology Stack
- **Framework**: Next.js 14+ (React)
- **Styling**: TailwindCSS + CSS Modules
- **State Management**: Zustand + React Query
- **Offline Storage**: IndexedDB + LocalStorage
- **Service Worker**: Workbox
- **PWA**: PWA support for mobile
- **Barcode Scanning**: jsQR or native camera API
- **Printing**: Print.js or native print API
- **Real-time**: WebSocket for live updates

### 1.2 Component Structure

```
src/
├── components/
│   ├── POS/
│   │   ├── CheckoutScreen.tsx
│   │   ├── ProductSearch.tsx
│   │   ├── ShoppingCart.tsx
│   │   ├── PaymentMethods.tsx
│   │   ├── ReceiptDisplay.tsx
│   │   └── TransactionHistory.tsx
│   ├── Manager/
│   │   ├── Dashboard.tsx
│   │   ├── SalesDisplay.tsx
│   │   ├── StaffActivity.tsx
│   │   └── AlertsPanel.tsx
│   ├── Common/
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── OfflineIndicator.tsx
│   │   └── ErrorBoundary.tsx
│   └── Accessibility/
│       ├── SkipLinks.tsx
│       └── AccessibilityMenu.tsx
├── pages/
│   ├── pos/
│   │   ├── checkout.tsx
│   │   ├── transactions.tsx
│   │   └── settings.tsx
│   ├── manager/
│   │   ├── dashboard.tsx
│   │   ├── reports.tsx
│   │   └── staff.tsx
│   └── index.tsx
├── services/
│   ├── offline/
│   │   ├── offlineService.ts
│   │   ├── syncService.ts
│   │   └── cacheService.ts
│   ├── api/
│   │   ├── posApi.ts
│   │   ├── paymentApi.ts
│   │   └── inventoryApi.ts
│   └── utils/
│       ├── performance.ts
│       ├── accessibility.ts
│       └── device.ts
├── hooks/
│   ├── useOfflineMode.ts
│   ├── useSync.ts
│   ├── useCart.ts
│   └── usePayment.ts
├── store/
│   ├── posStore.ts
│   ├── offlineStore.ts
│   └── uiStore.ts
└── styles/
    ├── globals.css
    ├── responsive.css
    └── accessibility.css
```

---

## 2. POS UI Components

### 2.1 Checkout Screen Component

```typescript
// CheckoutScreen.tsx
interface CheckoutScreenProps {
  branchId: number;
  userId: bigint;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  branchId,
  userId,
}) => {
  const { cart, total, tax, subtotal } = useCart();
  const { isOffline } = useOfflineMode();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>();

  return (
    <div className="checkout-screen">
      {/* Product Search */}
      <ProductSearch onProductSelect={addToCart} />

      {/* Shopping Cart */}
      <ShoppingCart items={cart} onQuantityChange={updateQuantity} />

      {/* Totals */}
      <div className="totals">
        <div>Subtotal: {subtotal}</div>
        <div>Tax: {tax}</div>
        <div className="total">Total: {total}</div>
      </div>

      {/* Payment Methods */}
      <PaymentMethods
        selected={selectedPaymentMethod}
        onSelect={setSelectedPaymentMethod}
        isOffline={isOffline}
      />

      {/* Action Buttons */}
      <div className="actions">
        <button onClick={completeTransaction}>Complete Sale</button>
        <button onClick={parkTransaction}>Park Transaction</button>
        <button onClick={clearCart}>Clear Cart</button>
      </div>

      {/* Offline Indicator */}
      {isOffline && <OfflineIndicator />}
    </div>
  );
};
```

### 2.2 Product Search Component

```typescript
// ProductSearch.tsx
interface ProductSearchProps {
  onProductSelect: (product: Product) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onProductSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const { searchProducts } = useProductSearch();

  useEffect(() => {
    if (searchQuery.length > 0) {
      const timer = setTimeout(() => {
        searchProducts(searchQuery).then(setResults);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  return (
    <div className="product-search">
      <input
        type="text"
        placeholder="Search product or scan barcode"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoFocus
      />

      <div className="search-results">
        {results.map((product) => (
          <button
            key={product.id}
            onClick={() => onProductSelect(product)}
            className="product-result"
          >
            <img src={product.image} alt={product.name} />
            <div>
              <div className="product-name">{product.name}</div>
              <div className="product-price">{product.price}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 2.3 Shopping Cart Component

```typescript
// ShoppingCart.tsx
interface ShoppingCartProps {
  items: CartItem[];
  onQuantityChange: (itemId: bigint, quantity: number) => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onQuantityChange,
}) => {
  return (
    <div className="shopping-cart">
      <h3>Shopping Cart</h3>
      <div className="cart-items">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="item-info">
              <div className="item-name">{item.name}</div>
              <div className="item-price">{item.price}</div>
            </div>
            <div className="quantity-control">
              <button onClick={() => onQuantityChange(item.id, item.quantity - 1)}>
                -
              </button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  onQuantityChange(item.id, parseInt(e.target.value))
                }
              />
              <button onClick={() => onQuantityChange(item.id, item.quantity + 1)}>
                +
              </button>
            </div>
            <div className="item-total">{item.total}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 3. Offline Mode Implementation

### 3.1 Offline Service

```typescript
// offlineService.ts
class OfflineService {
  private db: IDBDatabase;
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.initializeDB();
    this.setupNetworkListeners();
  }

  private initializeDB(): void {
    const request = indexedDB.open("SmartPOS", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      db.createObjectStore("transactions", { keyPath: "id" });
      db.createObjectStore("products", { keyPath: "id" });
      db.createObjectStore("customers", { keyPath: "id" });
      db.createObjectStore("inventory", { keyPath: "id" });
      db.createObjectStore("syncQueue", { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };
  }

  async storeTransaction(transaction: Transaction): Promise<void> {
    const store = this.db
      .transaction("transactions", "readwrite")
      .objectStore("transactions");
    await store.add(transaction);
  }

  async getOfflineTransactions(): Promise<Transaction[]> {
    const store = this.db
      .transaction("transactions", "readonly")
      .objectStore("transactions");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async cacheProducts(products: Product[]): Promise<void> {
    const store = this.db
      .transaction("products", "readwrite")
      .objectStore("products");
    for (const product of products) {
      await store.put(product);
    }
  }

  async getCachedProducts(): Promise<Product[]> {
    const store = this.db
      .transaction("products", "readonly")
      .objectStore("products");
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private setupNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.syncOfflineData();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
    });
  }

  private async syncOfflineData(): Promise<void> {
    const transactions = await this.getOfflineTransactions();
    for (const transaction of transactions) {
      try {
        await this.syncTransaction(transaction);
      } catch (error) {
        console.error("Sync failed:", error);
      }
    }
  }

  private async syncTransaction(transaction: Transaction): Promise<void> {
    // Sync transaction to backend
    const response = await fetch("/api/v1/transactions/sync", {
      method: "POST",
      body: JSON.stringify(transaction),
    });

    if (response.ok) {
      // Remove from offline queue
      const store = this.db
        .transaction("transactions", "readwrite")
        .objectStore("transactions");
      await store.delete(transaction.id);
    }
  }
}

export const offlineService = new OfflineService();
```

### 3.2 Sync Service

```typescript
// syncService.ts
class SyncService {
  async syncOfflineData(): Promise<SyncResult> {
    const offlineTransactions = await offlineService.getOfflineTransactions();
    const results: SyncResult = {
      synced: 0,
      failed: 0,
      errors: [],
    };

    for (const transaction of offlineTransactions) {
      try {
        await this.syncTransaction(transaction);
        results.synced++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          transactionId: transaction.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  private async syncTransaction(transaction: Transaction): Promise<void> {
    const response = await fetch("/api/v1/transactions/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }
}

export const syncService = new SyncService();
```

---

## 4. Responsive Design

### 4.1 Breakpoints

```css
/* Mobile: 320px - 640px */
@media (max-width: 640px) {
  .checkout-screen {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .product-search {
    flex: 1;
  }

  .shopping-cart {
    flex: 1;
    max-height: 200px;
    overflow-y: auto;
  }

  button {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Tablet: 641px - 1024px */
@media (min-width: 641px) and (max-width: 1024px) {
  .checkout-screen {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .product-search {
    grid-column: 1 / 3;
  }
}

/* Desktop: 1025px+ */
@media (min-width: 1025px) {
  .checkout-screen {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
}
```

### 4.2 Touch Optimization

```css
/* Touch-friendly buttons */
button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
  margin: 0.25rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:active {
  transform: scale(0.98);
}

/* No hover on touch devices */
@media (hover: none) {
  button:hover {
    background-color: inherit;
  }
}

/* Haptic feedback */
button:active {
  -webkit-user-select: none;
  user-select: none;
}
```

---

## 5. Performance Optimization

### 5.1 Code Splitting

```typescript
// pages/pos/checkout.tsx
import dynamic from "next/dynamic";

const CheckoutScreen = dynamic(
  () => import("@/components/POS/CheckoutScreen"),
  { loading: () => <div>Loading...</div> }
);

export default function CheckoutPage() {
  return <CheckoutScreen />;
}
```

### 5.2 Image Optimization

```typescript
// Product image optimization
import Image from "next/image";

export const ProductImage: React.FC<{ src: string; alt: string }> = ({
  src,
  alt,
}) => (
  <Image
    src={src}
    alt={alt}
    width={100}
    height={100}
    priority={false}
    loading="lazy"
  />
);
```

### 5.3 Caching Strategy

```typescript
// Service Worker caching
const CACHE_NAME = "smartpos-v1";
const urlsToCache = [
  "/",
  "/pos/checkout",
  "/offline.html",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

## 6. Accessibility Implementation

### 6.1 WCAG 2.1 AA Compliance

```typescript
// Accessible button component
interface AccessibleButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  onClick,
  children,
  ariaLabel,
  disabled,
}) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    disabled={disabled}
    className="accessible-button"
  >
    {children}
  </button>
);
```

### 6.2 Keyboard Navigation

```typescript
// Keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "s":
          event.preventDefault();
          completeTransaction();
          break;
        case "p":
          event.preventDefault();
          parkTransaction();
          break;
        case "c":
          event.preventDefault();
          clearCart();
          break;
      }
    }
  };

  window.addEventListener("keydown", handleKeyPress);
  return () => window.removeEventListener("keydown", handleKeyPress);
}, []);
```

---

## 7. Device Detection & Adaptation

```typescript
// useDevice hook
export const useDevice = () => {
  const [device, setDevice] = useState<"phone" | "tablet" | "desktop">(
    "desktop"
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 641) {
        setDevice("phone");
      } else if (width < 1025) {
        setDevice("tablet");
      } else {
        setDevice("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return device;
};
```

---

## 8. Performance Targets

- Page load time: < 2 seconds
- Interaction response: < 100ms
- Animation smoothness: 60fps
- Offline transaction processing: < 500ms
- Sync latency: < 1 second
- Search results: < 100ms
- Memory usage: < 100MB
- Battery usage: Optimized

