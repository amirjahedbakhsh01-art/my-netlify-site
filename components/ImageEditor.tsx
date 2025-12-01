import React, { useState, useRef, useEffect } from 'react';
import { editImage, generateDietPlan } from '../services/geminiService';
import { Upload, Wand2, Loader2, Image as ImageIcon, Download, ArrowRight, Activity, Scale, ChefHat, HeartPulse, Sparkles } from 'lucide-react';

type SmartRoomMode = 'MENU' | 'IMAGE' | 'DIET';

export const ImageEditor: React.FC = () => {
  const [mode, setMode] = useState<SmartRoomMode>('MENU');

  // --- Image Editor State ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgPrompt, setImgPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgResultRef = useRef<HTMLDivElement>(null);

  // --- Dietitian State ---
  const [dietForm, setDietForm] = useState({ height: '', weight: '', age: '', gender: 'male' });
  const [dietPlan, setDietPlan] = useState<string | null>(null);
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState<string | null>(null);
  const dietResultRef = useRef<HTMLDivElement>(null);

  // --- Handlers: Image Editor ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImage(null);
      setImgError(null);
    }
  };

  const handleEdit = async () => {
    if (!selectedFile || !imgPrompt) return;
    setImgLoading(true);
    setImgError(null);
    setGeneratedImage(null);
    try {
      const resultUrl = await editImage(selectedFile, imgPrompt);
      setGeneratedImage(resultUrl);
      // Auto scroll to result
      setTimeout(() => {
        imgResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("API Key is missing")) {
        setImgError('خطا: API Key یافت نشد. لطفا تنظیمات نتلیفای را بررسی کنید.');
      } else {
        setImgError('خطا در پردازش تصویر. لطفا دوباره تلاش کنید.');
      }
    } finally {
      setImgLoading(false);
    }
  };

  // --- Handlers: Dietitian ---
  const handleDietSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dietForm.height || !dietForm.weight || !dietForm.age) return;

    setDietLoading(true);
    setDietError(null);
    setDietPlan(null);

    try {
      const result = await generateDietPlan(dietForm.height, dietForm.weight, dietForm.age, dietForm.gender);
      setDietPlan(result);
      // Auto scroll to result
      setTimeout(() => {
        dietResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("API Key is missing")) {
        setDietError('خطا: API Key یافت نشد. لطفا تنظیمات نتلیفای را بررسی کنید.');
      } else {
        setDietError('متاسفانه مشکلی پیش آمد. لطفا دوباره تلاش کنید.');
      }
    } finally {
      setDietLoading(false);
    }
  };

  // --- Render Functions ---
  const renderMenu = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in overflow-y-auto pb-24">
      <div className="text-center mb-10">
        <div className="bg-gradient-to-br from-purple-500 to-blue-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl ring-4 ring-purple-100">
          <Sparkles className="text-white w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">اتاق هوشمند همتی</h2>
        <p className="text-gray-600 max-w-xs mx-auto">ابزارهای هوش مصنوعی برای زندگی بهتر</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <button 
          onClick={() => setMode('IMAGE')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="bg-purple-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <Wand2 className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">جادوی تصویر</h3>
          <p className="text-sm text-gray-500">ویرایش و تغییر تصاویر با هوش مصنوعی</p>
        </button>

        <button 
          onClick={() => setMode('DIET')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group flex flex-col items-center text-center"
        >
          <div className="bg-green-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
            <HeartPulse className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-bold text-lg text-gray-800 mb-1">مشاور سلامتی</h3>
          <p className="text-sm text-gray-500">تحلیل وزن و دریافت رژیم غذایی</p>
        </button>
      </div>
    </div>
  );

  const renderImageEditor = () => (
    <div className="flex flex-col h-full overflow-y-auto pb-32 p-4 max-w-4xl mx-auto w-full animate-fade-in scroll-smooth">
      <button onClick={() => setMode('MENU')} className="flex items-center gap-2 text-gray-500 hover:text-brand-blue mb-6 w-fit shrink-0">
        <ArrowRight className="w-4 h-4" /> بازگشت
      </button>

      <div className="text-center mb-6 shrink-0">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Wand2 className="w-6 h-6 text-purple-600" />
          جادوی تصویر
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              previewUrl ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept="image/*"
            />
            {previewUrl ? (
              <div className="relative group">
                <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                  <p className="text-white font-medium flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    تغییر تصویر
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border">
                  <ImageIcon className="text-gray-400 w-6 h-6" />
                </div>
                <p className="font-medium text-gray-700">برای آپلود تصویر کلیک کنید</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">چه تغییری می‌خواهید؟</label>
            <textarea
              value={imgPrompt}
              onChange={(e) => setImgPrompt(e.target.value)}
              placeholder="مثلا: پس زمینه را حذف کن، یک گلدان به تصویر اضافه کن..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all h-24 resize-none"
              dir="rtl"
            />
          </div>

          <button
            onClick={handleEdit}
            disabled={!selectedFile || !imgPrompt || imgLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {imgLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
            {imgLoading ? 'در حال پردازش...' : 'اعمال تغییرات'}
          </button>
          
          {imgError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{imgError}</div>}
        </div>

        <div ref={imgResultRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px]">
           {generatedImage ? (
             <div className="w-full space-y-4 animate-fade-in">
               <h3 className="text-lg font-bold text-gray-800 text-center">نتیجه نهایی</h3>
               <img src={generatedImage} alt="Generated" className="w-full rounded-xl shadow-lg border border-gray-100" />
               <a 
                href={generatedImage} 
                download="hemmati-edited.png"
                className="flex items-center justify-center gap-2 w-full py-3 text-purple-600 font-medium bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
               >
                 <Download className="w-4 h-4" /> دانلود
               </a>
             </div>
           ) : (
             <div className="text-center text-gray-400">
               <Wand2 className="text-gray-300 w-12 h-12 mx-auto mb-4" />
               <p>هنوز تصویری تولید نشده است</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );

  const renderDietitian = () => (
    <div className="flex flex-col h-full overflow-y-auto pb-32 p-4 max-w-2xl mx-auto w-full animate-fade-in scroll-smooth">
      <button onClick={() => setMode('MENU')} className="flex items-center gap-2 text-gray-500 hover:text-brand-blue mb-6 w-fit shrink-0">
        <ArrowRight className="w-4 h-4" /> بازگشت
      </button>

      <div className="text-center mb-8 shrink-0">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Activity className="text-green-600 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">مشاور سلامتی هوشمند</h2>
        <p className="text-gray-600">تحلیل وزن و دریافت برنامه غذایی سالم</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 shrink-0">
        <form onSubmit={handleDietSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">قد (سانتی‌متر)</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  value={dietForm.height}
                  onChange={e => setDietForm({...dietForm, height: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none transition-all"
                  placeholder="175"
                />
                <Scale className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">وزن (کیلوگرم)</label>
              <div className="relative">
                <input
                  required
                  type="number"
                  value={dietForm.weight}
                  onChange={e => setDietForm({...dietForm, weight: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none transition-all"
                  placeholder="75"
                />
                <Scale className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">سن</label>
              <input
                required
                type="number"
                value={dietForm.age}
                onChange={e => setDietForm({...dietForm, age: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none transition-all"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">جنسیت</label>
              <select
                value={dietForm.gender}
                onChange={e => setDietForm({...dietForm, gender: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-green-500 outline-none transition-all bg-white"
              >
                <option value="male">مرد</option>
                <option value="female">زن</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={dietLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold transition-colors shadow-lg shadow-green-200 mt-4 flex items-center justify-center gap-2"
          >
            {dietLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
            {dietLoading ? 'در حال تحلیل...' : 'محاسبه وزن و دریافت رژیم'}
          </button>
        </form>
      </div>

      {dietError && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-6 shrink-0">{dietError}</div>}

      {dietPlan && (
        <div ref={dietResultRef} className="animate-fade-in bg-white rounded-2xl p-6 shadow-md border border-green-100 relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-teal-500"></div>
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
            <HeartPulse className="w-6 h-6" />
            نتیجه آنالیز شما
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {dietPlan}
          </div>
          <div className="mt-6 p-4 bg-green-50 rounded-xl flex items-start gap-3">
             <div className="bg-white p-2 rounded-full shadow-sm text-green-600">
               <Scale className="w-5 h-5" />
             </div>
             <div>
               <p className="font-bold text-green-800 text-sm">نکته مهم</p>
               <p className="text-xs text-green-700 mt-1">این برنامه توسط هوش مصنوعی پیشنهاد شده است. لطفا قبل از تغییر جدی در رژیم غذایی خود با پزشک متخصص مشورت کنید.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full bg-slate-50 overflow-hidden relative">
      {mode === 'MENU' && renderMenu()}
      {mode === 'IMAGE' && renderImageEditor()}
      {mode === 'DIET' && renderDietitian()}
    </div>
  );
};