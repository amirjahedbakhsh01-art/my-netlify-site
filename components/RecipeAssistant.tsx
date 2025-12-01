import React, { useState, useEffect } from 'react';
import { generateRecipe } from '../services/geminiService';
import { RecipeResponse, Ingredient, Product } from '../types';
import { getProducts } from '../services/dbService';
import { Loader2, ChefHat, ShoppingCart, Clock, Plus, Check, Filter, AlertCircle } from 'lucide-react';

interface RecipeAssistantProps {
  addToCart: (product: Product) => void;
  onGoToStore: () => void;
}

export const RecipeAssistant: React.FC<RecipeAssistantProps> = ({ addToCart, onGoToStore }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setRecipe(null);
    setAddedItems(new Set());
    setShowAvailableOnly(false);

    try {
      const result = await generateRecipe(input);
      setRecipe(result);
    } catch (err: any) {
      if (err.message && err.message.includes("API Key is missing")) {
        setError('کلید API تنظیم نشده است. لطفا در تنظیمات Netlify مقدار API_KEY را وارد کنید.');
      } else {
        setError('متاسفانه در دریافت دستور پخت مشکلی پیش آمد. لطفا دوباره تلاش کنید.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const findProductMatch = (ingredientName: string): Product | undefined => {
    // Simple fuzzy matching
    // 1. Try exact match (normalized)
    // 2. Try if product name contains ingredient name
    // 3. Try if ingredient name contains product name
    const normalizedIng = ingredientName.trim();
    
    return products.find(p => {
      const pName = p.name;
      return pName.includes(normalizedIng) || normalizedIng.includes(pName);
    });
  };

  const handleAddProduct = (product: Product) => {
    addToCart(product);
    setAddedItems(prev => new Set(prev).add(product.id));
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20 p-4 max-w-2xl mx-auto w-full">
      <div className="text-center mb-8 mt-4">
        <div className="bg-brand-yellow w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ChefHat className="text-brand-blue w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-brand-blue mb-2">امروز چه غذایی می‌پزید؟</h2>
        <p className="text-gray-600">نام غذا را بنویسید تا دستور پخت و مواد اولیه را دریافت کنید</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 sticky top-0 z-10 bg-slate-50 pt-2 pb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="مثلا: قورمه سبزی، پاستا آلفردو..."
            className="flex-1 px-4 py-3 rounded-xl border-2 border-brand-blue/20 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={loading || !input}
            className="bg-brand-blue hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'جستجو'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {recipe && (
        <div className="animate-fade-in space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-blue/10">
            <div className="flex justify-between items-start mb-6 border-b pb-4 border-gray-100">
              <h3 className="text-2xl font-bold text-brand-blue">{recipe.dishName}</h3>
              <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-medium">
                <Clock className="w-4 h-4 ml-1" />
                {recipe.cookingTime}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="flex items-center text-lg font-bold text-gray-800">
                  <ShoppingCart className="w-5 h-5 ml-2 text-brand-yellow" />
                  مواد اولیه
                </h4>
                <button 
                  onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border transition-all ${
                    showAvailableOnly 
                      ? 'bg-brand-blue text-white border-brand-blue' 
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  {showAvailableOnly ? 'نمایش همه' : 'فقط کالاهای موجود'}
                </button>
              </div>

              <div className="grid gap-3">
                {recipe.ingredients
                  .filter(ing => !showAvailableOnly || findProductMatch(ing.name))
                  .map((ing: Ingredient, idx: number) => {
                    const match = findProductMatch(ing.name);
                    const isAdded = match && addedItems.has(match.id);
                    
                    return (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${match ? 'border-brand-blue/20 bg-blue-50/50' : 'border-gray-100 bg-white'}`}>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{ing.name}</span>
                          <span className="text-xs text-gray-500">{ing.amount}</span>
                          {match && (
                            <span className="text-[10px] text-green-600 font-medium mt-1 flex items-center gap-1">
                              <Check className="w-3 h-3" /> موجود: {match.name} ({match.price.toLocaleString()} ت)
                            </span>
                          )}
                        </div>
                        
                        {match && (
                          <button 
                            onClick={() => handleAddProduct(match)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all ${
                              isAdded 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-brand-blue text-white hover:bg-blue-800'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-4 h-4" />
                                افزوده شد
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4" />
                                خرید
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {showAvailableOnly && recipe.ingredients.filter(ing => findProductMatch(ing.name)).length === 0 && (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      هیچ کالای مشابهی در فروشگاه یافت نشد.
                    </div>
                  )}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4">دستور پخت سریع</h4>
              <ol className="space-y-4 relative border-r-2 border-brand-yellow/30 pr-4 mr-2">
                {recipe.instructions.map((step: string, idx: number) => (
                  <li key={idx} className="relative">
                    <span className="absolute -right-[23px] top-1 w-3 h-3 rounded-full bg-brand-yellow ring-4 ring-white"></span>
                    <p className="text-gray-600 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          
          <div className="bg-brand-blue text-white p-6 rounded-2xl text-center shadow-lg">
            <h4 className="text-xl font-bold mb-2">همه چیز آماده است؟</h4>
            <p className="mb-4 opacity-90">مواد اولیه را به سبد خرید اضافه کنید و سفارش خود را تکمیل کنید.</p>
            <button 
              onClick={onGoToStore}
              className="bg-brand-yellow text-brand-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-300 transition-colors shadow-lg flex items-center justify-center gap-2 mx-auto"
            >
              <ShoppingCart className="w-5 h-5" />
              مشاهده سبد خرید و پرداخت
            </button>
          </div>
        </div>
      )}
    </div>
  );
};