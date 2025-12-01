import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Product } from '../types';
import { getOrders, updateOrderStatus, getProducts, saveProduct, deleteProduct, PRODUCT_CATEGORIES } from '../services/dbService';
import { 
  CheckCircle, MapPin, Phone, 
  RefreshCw, Lock, LogOut, LayoutDashboard, 
  ShoppingBag, Bell, Package, Plus, Edit2, Trash2, X, Ban
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState<'ORDERS' | 'PRODUCTS'>('ORDERS');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Product Form State
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    category: 'خواربار',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'
  });

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      const interval = setInterval(refreshData, 30000); // Auto refresh every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const refreshData = () => {
    setOrders(getOrders().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setProducts(getProducts());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'abedhmti2254' && password === 'hmti552238') {
      setIsAuthenticated(true);
    } else {
      alert('نام کاربری یا رمز عبور اشتباه است');
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    refreshData();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      deleteProduct(id);
      refreshData();
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const product: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      category: formData.category || 'سایر',
      unit: formData.unit || 'عدد',
      image: formData.image || '',
    };

    saveProduct(product);
    setIsProductFormOpen(false);
    setEditingProduct(null);
    setFormData({
      category: 'خواربار',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'
    });
    refreshData();
  };

  const openProductForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        category: 'خواربار',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300'
      });
    }
    setIsProductFormOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="bg-brand-blue w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <Lock className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">پنل مدیریت فروشگاه</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">نام کاربری</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue outline-none transition-all text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue outline-none transition-all text-left"
                dir="ltr"
              />
            </div>
          </div>

          <button type="submit" className="w-full mt-6 bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-lg">
            ورود به پنل
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-brand-blue flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            داشبورد
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveSection('ORDERS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
              activeSection === 'ORDERS' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-5 h-5" />
            سفارش‌های دریافتی
            {orders.some(o => o.status === 'PENDING') && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mr-auto shadow-sm">
                {orders.filter(o => o.status === 'PENDING').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('PRODUCTS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
              activeSection === 'PRODUCTS' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5" />
            مدیریت محصولات
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full px-4 py-2 font-medium transition-colors">
            <LogOut className="w-5 h-5" />
            خروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
        {/* Mobile Header for switching sections */}
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
           <button
            onClick={() => setActiveSection('ORDERS')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${
              activeSection === 'ORDERS' ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <Bell className="w-4 h-4" />
            سفارشات
            {orders.some(o => o.status === 'PENDING') && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {orders.filter(o => o.status === 'PENDING').length}
              </span>
            )}
          </button>
           <button
            onClick={() => setActiveSection('PRODUCTS')}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${
              activeSection === 'PRODUCTS' ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <Package className="w-4 h-4" />
            محصولات
          </button>
        </div>

        {activeSection === 'ORDERS' ? (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">لیست سفارشات</h2>
              <button onClick={refreshData} className="p-2 hover:bg-white bg-gray-50 rounded-full text-gray-600 transition-colors shadow-sm">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>هیچ سفارشی ثبت نشده است</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map(order => (
                  <div key={order.id} className={`bg-white rounded-2xl p-6 border-r-4 shadow-sm transition-all hover:shadow-md ${
                    order.status === 'PENDING' ? 'border-brand-yellow' : 
                    order.status === 'SHIPPED' ? 'border-blue-500' :
                    order.status === 'COMPLETED' ? 'border-green-500' : 'border-red-500'
                  }`}>
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-gray-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg text-gray-800">{order.customerName}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-mono">
                            {new Date(order.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                           <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {order.phone}</span>
                           <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {order.address}</span>
                           <span className="flex items-center gap-2 bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-xs w-fit">
                             کد سفارش: <span className="font-mono">{order.id}</span>
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[140px]">
                         <div className="flex items-center gap-2">
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-bold outline-none cursor-pointer transition-colors ${
                                order.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                order.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              <option value="PENDING">در حال بررسی</option>
                              <option value="SHIPPED">ارسال شد</option>
                              <option value="COMPLETED">تکمیل شده</option>
                              <option value="CANCELLED">لغو شده</option>
                            </select>
                            
                            {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                              <button 
                                onClick={() => {
                                  if(confirm('آیا از لغو این سفارش اطمینان دارید؟')) {
                                    handleStatusChange(order.id, 'CANCELLED');
                                  }
                                }}
                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                                title="لغو سفارش"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                         </div>
                         <span className="font-bold text-brand-blue text-center text-lg">{order.totalAmount.toLocaleString()} تومان</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" />
                        اقلام سفارش:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white rounded-lg border border-gray-100">
                             <span className="flex items-center gap-2">
                               <span className="bg-brand-blue text-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold shadow-sm">
                                 {item.quantity}
                               </span>
                               <span className="text-gray-700">{item.name}</span>
                             </span>
                             <span className="text-gray-400 text-xs font-mono">{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">مدیریت محصولات</h2>
              <button 
                onClick={() => openProductForm()}
                className="bg-brand-blue text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-md font-medium"
              >
                <Plus className="w-5 h-5" />
                افزودن محصول
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col group hover:shadow-md transition-all">
                  <div className="relative aspect-video mb-3 rounded-xl overflow-hidden bg-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <button 
                        onClick={() => openProductForm(product)}
                        className="p-3 bg-white rounded-full text-brand-blue hover:scale-110 transition-transform shadow-lg"
                        title="ویرایش"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-3 bg-white rounded-full text-red-500 hover:scale-110 transition-transform shadow-lg"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                  <div className="flex justify-between items-center mt-auto text-sm">
                    <span className="text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">{product.category}</span>
                    <span className="font-bold text-brand-blue">{product.price.toLocaleString()} تومان</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      {isProductFormOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProduct ? 'ویرایش محصول' : 'افزودن محصول جدید'}
              </h3>
              <button onClick={() => setIsProductFormOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">نام محصول</label>
                <input
                  required
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all"
                  placeholder="مثلا: شیر پرچرب کاله"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">قیمت (تومان)</label>
                  <input
                    required
                    type="number"
                    value={formData.price || ''}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">واحد</label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all"
                    placeholder="مثلا: عدد، کیلوگرم"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">دسته‌بندی</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all cursor-pointer bg-white"
                >
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="سایر">سایر</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">لینک تصویر</label>
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none transition-all text-left ltr"
                />
                {formData.image && (
                  <div className="mt-3 h-40 rounded-xl overflow-hidden bg-gray-50 border border-gray-200">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsProductFormOpen(false)}
                  className="flex-1 py-3.5 rounded-xl border-2 border-gray-100 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 rounded-xl bg-brand-blue text-white font-bold hover:bg-blue-900 shadow-lg shadow-brand-blue/20 transition-all transform hover:-translate-y-0.5"
                >
                  {editingProduct ? 'ذخیره تغییرات' : 'افزودن محصول'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};