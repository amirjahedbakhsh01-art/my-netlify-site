import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order } from '../types';
import { getProducts, createOrder, getOrderById } from '../services/dbService';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, ShoppingBag, UtensilsCrossed, Coffee, Milk, Beef, Snowflake, Sparkles, IceCream, Wallet, CreditCard, Search, X, PackageCheck, Cigarette } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'همه', icon: ShoppingBag },
  { id: 'لبنیات', label: 'لبنیات', icon: Milk },
  { id: 'خواربار', label: 'خواربار', icon: ShoppingBag },
  { id: 'پروتئینی', label: 'پروتئینی', icon: Beef },
  { id: 'نوشیدنی', label: 'نوشیدنی', icon: Coffee },
  { id: 'تنقلات', label: 'تنقلات', icon: UtensilsCrossed },
  { id: 'بستنی', label: 'بستنی', icon: IceCream },
  { id: 'فست فود و منجمد', label: 'فست فود و منجمد', icon: Snowflake },
  { id: 'بهداشتی', label: 'بهداشتی', icon: Sparkles },
  { id: 'دخانیات و مواد افزودنی', label: 'دخانیات', icon: Cigarette },
  { id: 'مواد افزودنی', label: 'مواد افزودنی', icon: Plus },
];

interface OnlineStoreProps {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
}

export const OnlineStore: React.FC<OnlineStoreProps> = ({ 
  cart, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckout, setIsCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', address: '', phone: '' });
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  
  // Tracking State
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackingError, setTrackingError] = useState('');

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrder = createOrder({
      customerName: customerInfo.name,
      address: customerInfo.address,
      phone: customerInfo.phone,
      items: cart,
      totalAmount,
    });

    clearCart();
    setCompletedOrder(newOrder);
    setIsCheckout(false);
    setCustomerInfo({ name: '', address: '', phone: '' });
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId) return;

    const order = getOrderById(trackingId);
    if (order) {
      setTrackedOrder(order);
      setTrackingError('');
    } else {
      setTrackedOrder(null);
      setTrackingError('سفارشی با این کد یافت نشد.');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = p.name.includes(searchQuery) || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'PENDING': return { text: 'در حال بررسی', color: 'text-yellow-600 bg-yellow-100' };
      case 'SHIPPED': return { text: 'ارسال شد', color: 'text-blue-600 bg-blue-100' };
      case 'COMPLETED': return { text: 'تحویل شده', color: 'text-green-600 bg-green-100' };
      case 'CANCELLED': return { text: 'لغو شده', color: 'text-red-600 bg-red-100' };
      default: return { text: status, color: 'text-gray-600 bg-gray-100' };
    }
  };

  // Success Screen
  if (completedOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-fade-in bg-white">
        <div className="bg-green-100 p-6 rounded-full mb-6 ring-8 ring-green-50">
          <CheckCircle2 className="w-20 h-20 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">سفارش ثبت شد!</h2>
        <p className="text-gray-600 mb-8">سفارش شما با موفقیت دریافت شد و در اسرع وقت ارسال خواهد شد.</p>
        
        <div className="bg-brand-lightBlue w-full max-w-sm p-6 rounded-2xl border border-brand-blue/20 mb-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-20 h-20 bg-brand-blue/10 rounded-full -mr-10 -mt-10"></div>
           <p className="text-sm text-brand-blue font-bold mb-2">کد پیگیری سفارش شما:</p>
           <div className="bg-white px-4 py-3 rounded-xl border-2 border-brand-blue border-dashed text-2xl font-mono font-bold tracking-wider text-gray-800 select-all">
             {completedOrder.id}
           </div>
           <p className="text-xs text-gray-500 mt-3">لطفا این کد را برای پیگیری وضعیت سفارش ذخیره کنید.</p>
        </div>

        <button 
          onClick={() => setCompletedOrder(null)}
          className="bg-brand-blue text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl w-full max-w-sm"
        >
          بازگشت به فروشگاه
        </button>
      </div>
    );
  }

  // Checkout Screen
  if (isCheckout) {
    return (
      <div className="h-full overflow-y-auto p-4 max-w-2xl mx-auto w-full pb-24">
        <button 
          onClick={() => setIsCheckout(false)}
          className="text-gray-500 mb-4 flex items-center gap-1 hover:text-brand-blue font-medium"
        >
          → بازگشت به محصولات
        </button>
        
        <h2 className="text-2xl font-bold text-brand-blue mb-6">تکمیل خرید</h2>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
             <h3 className="font-bold text-gray-800">سبد خرید شما</h3>
             <button onClick={clearCart} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition-colors">حذف همه</button>
          </div>
          
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center py-3 border-b last:border-0 border-gray-50">
              <div className="flex items-center gap-3">
                <span className="bg-brand-yellow/20 text-brand-blue w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">
                  {item.quantity}
                </span>
                <div className="flex flex-col">
                  <span className="text-gray-700 font-medium">{item.name}</span>
                  <span className="text-xs text-gray-400">{item.unit}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900 text-sm">{(item.price * item.quantity).toLocaleString()} تومان</span>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  title="حذف از سبد"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-200">
            <span className="font-bold text-lg">مبلغ قابل پرداخت:</span>
            <span className="font-bold text-xl text-brand-blue">{totalAmount.toLocaleString()} تومان</span>
          </div>
        </div>

        <form onSubmit={handleCheckout} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-bold text-gray-800 mb-2">اطلاعات گیرنده</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
            <input 
              required
              type="text" 
              value={customerInfo.name}
              onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شماره تماس</label>
            <input 
              required
              type="tel" 
              value={customerInfo.phone}
              onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">آدرس دقیق</label>
            <textarea 
              required
              rows={3}
              value={customerInfo.address}
              onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">شیوه پرداخت</label>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl border-2 border-brand-blue bg-blue-50 cursor-pointer transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-brand-blue">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">پرداخت درب منزل</span>
                    <span className="text-xs text-gray-500">کارتخوان سیار موجود است</span>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-[6px] border-brand-blue bg-white" />
              </label>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-500">پرداخت اینترنتی</span>
                </div>
                <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded-md">بزودی</span>
              </div>
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-brand-yellow hover:bg-yellow-400 text-brand-blue font-bold py-4 rounded-xl shadow-md transition-colors mt-4 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            ثبت نهایی سفارش
          </button>
        </form>
      </div>
    );
  }

  // Main Store View
  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-slate-50">
      
      {/* Sticky Header with Search and Categories */}
      <div className="bg-white shadow-sm z-10 sticky top-0 flex flex-col">
         {/* Top Row: Tracking & Search */}
         <div className="flex items-center gap-2 p-3 border-b border-gray-100">
           <button 
             onClick={() => setIsTrackingOpen(true)}
             className="px-3 py-2 text-brand-blue hover:bg-blue-50 rounded-xl transition-colors flex flex-col items-center justify-center min-w-[60px]"
           >
             <PackageCheck className="w-5 h-5 mb-1" />
             <span className="text-[10px] font-bold">پیگیری</span>
           </button>

           <div className="flex-1 relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجو در محصولات..." 
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-100 border-transparent focus:bg-white focus:border-brand-blue/30 focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all text-sm"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
           </div>
         </div>

         {/* Bottom Row: Categories */}
         <div className="px-2 py-3 overflow-x-auto hide-scrollbar flex gap-2 w-full">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border ${
                    isSelected 
                      ? 'bg-brand-blue text-white border-brand-blue shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              );
            })}
         </div>
      </div>

      <div className="overflow-y-auto pb-24 p-4 flex-1">
        {filteredProducts.length === 0 ? (
           <div className="text-center py-20 opacity-50">
             {searchQuery ? (
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
             ) : (
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
             )}
             <p>{searchQuery ? 'محصولی با این نام یافت نشد' : 'محصولی در این دسته یافت نشد'}</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const inCart = cart.find(c => c.id === product.id);
              return (
                <div key={product.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow">
                  <div className="relative aspect-square mb-3 rounded-xl overflow-hidden bg-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{product.unit}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-brand-blue text-sm">{product.price.toLocaleString()}</span>
                    
                    {inCart ? (
                      <div className="flex items-center gap-2 bg-brand-lightBlue rounded-lg p-1">
                        <button 
                          onClick={() => inCart.quantity === 1 ? removeFromCart(product.id) : updateQuantity(product.id, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-white rounded text-brand-blue shadow-sm hover:bg-gray-50"
                        >
                          {inCart.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                        </button>
                        <span className="text-sm font-bold w-3 text-center">{inCart.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-brand-blue rounded text-white shadow-sm hover:bg-blue-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-brand-yellow hover:bg-yellow-400 text-brand-blue p-2 rounded-lg transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Summary Button */}
      {cart.length > 0 && (
        <div className="absolute bottom-20 left-4 right-4 animate-fade-in z-20">
          <button 
            onClick={() => setIsCheckout(true)}
            className="w-full bg-brand-blue text-white p-4 rounded-2xl shadow-xl flex items-center justify-between hover:bg-blue-900 transition-colors ring-2 ring-white/20"
          >
            <div className="flex items-center gap-3">
              <div className="bg-brand-yellow text-brand-blue w-8 h-8 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </div>
              <span className="font-bold">مشاهده سبد خرید</span>
            </div>
            <span className="font-bold text-lg">{totalAmount.toLocaleString()} تومان</span>
          </button>
        </div>
      )}

      {/* Tracking Modal */}
      {isTrackingOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 bg-brand-blue text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <PackageCheck className="w-5 h-5" />
                پیگیری سفارش
              </h3>
              <button onClick={() => setIsTrackingOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleTrackOrder} className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="کد پیگیری را وارد کنید"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue outline-none text-center font-mono"
                  dir="ltr"
                />
                <button 
                  type="submit"
                  className="bg-brand-yellow text-brand-blue px-4 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {trackingError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center text-sm mb-4">
                  {trackingError}
                </div>
              )}

              {trackedOrder && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-4 border-b pb-3 border-gray-200">
                    <span className="text-sm text-gray-500">وضعیت سفارش:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusLabel(trackedOrder.status).color}`}>
                      {getStatusLabel(trackedOrder.status).text}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">تاریخ:</span>
                      <span className="font-medium">{new Date(trackedOrder.createdAt).toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">مبلغ کل:</span>
                      <span className="font-bold text-brand-blue">{trackedOrder.totalAmount.toLocaleString()} تومان</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 text-sm">
                    <p className="font-bold mb-2 text-gray-700">اقلام:</p>
                    <ul className="space-y-1 text-gray-600">
                      {trackedOrder.items.map((item, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{item.name} <span className="text-xs text-gray-400">×{item.quantity}</span></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};