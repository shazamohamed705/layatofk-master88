# نظام إنشاء الإعلانات التجارية (NewAdd)

## نظرة عامة
نظام متكامل لإنشاء إعلانات تجارية بـ **خطوتين** مع تصميم احترافي يطابق نظام Share بالضبط

---

## 🔄 سير العمل الكامل

```
/advertising
    ↓
[أنشر إعلانك الآن] ← زر جديد بتصميم primary
    ↓
1️⃣ /new-add-cat  (اختيار الفئة)
   ────────────────────────────────
   📡 API: GET /api/adv_home?country_id=1
   📦 Response: { catgories: [...] }
   
   التصميم: نفس ShareAdds بالضبط
   
   [🚗 سيارات →] [🏠 عقارات →] [📱 جوالات →]
    ↓ اختار فئة (مثلاً: سيارات)
    
2️⃣ /new-add-share?category_id=95&category_name=سيارات
   ────────────────────────────────
   التصميم: نفس CarPages بالضبط
   
   • اسم الإعلان (30 حرف - بدون أرقام)  15/30
   • الوصف
   • السعر (د.ك)
   • واتساب
   • الصور (حتى 5 صور - drag & drop)
    ↓ [التالي]
    
3️⃣ /new-add-cer  (مراجعة ونشر)
   ────────────────────────────────
   📡 Check subscription: 
      GET /api/subscription-packages?type[]=1&type[]=4
      
   💰 Check wallet:
      GET /api/wallet
   
   ✓ المنطقة: [اختر من قائمة]
   ✓ رقم الهاتف: 0512345678
   
   [عرض الباقات النشطة] أو [زر الاشتراك]
   
   [رصيد المحفظة: X د.ك]
    ↓ [نشر]
    
📡 POST /api/newAdd
   ────────────────────────────────
   Content-Type: multipart/form-data
   
   FormData {
     name: "تويوتا كامري 2020 للبيع بحالة",
     description: "سيارة بحالة ممتازة...",
     price: "5000",
     whatsapp: "+96512345678",
     cat_id: "95",
     type: "1.4",           ← إعلان تجاري
     imgs[]: [File, File, File]
   }
    ↓
📦 Response: { status: true, message: "..." }
    ↓
✅ نجاح! → /advertising
```

---

## 📁 الملفات

### 1. NewAddCat.jsx
**المسار**: `/new-add-cat`  
**الوظيفة**: اختيار الفئة  
**API**: `GET /api/adv_home?country_id=1`  
**التصميم**: ✅ نفس ShareAdds بالضبط

**المميزات**:
- بطاقات أفقية (صورة + اسم + سهم)
- ترتيب حسب عدد الإعلانات
- Hover effects جميلة
- Loading & Error states

---

### 2. NewAddShare.jsx
**المسار**: `/new-add-share?category_id=X&category_name=Y`  
**الوظيفة**: إدخال بيانات الإعلان  
**التصميم**: ✅ نفس CarPages بالضبط

**الحقول**:
- ✅ اسم الإعلان (30 حرف - بدون أرقام)
- ✅ الوصف (textarea)
- ✅ السعر (د.ك)
- ✅ واتساب (رقم الهاتف)
- ✅ الصور (حتى 5 صور)

**المميزات**:
- عداد أحرف مباشر: `15/30`
- Validation على كل حقل
- Drag & drop للصور
- معاينة الصور مع إمكانية الحذف
- حفظ تلقائي في localStorage
- استرجاع البيانات المحفوظة

---

### 3. NewAddCer.jsx
**المسار**: `/new-add-cer`  
**الوظيفة**: التحقق من الباقات + مراجعة ونشر  
**APIs**:
- `GET /api/subscription-packages?type[]=1&type[]=4` - التحقق من الباقات
- `GET /api/wallet` - التحقق من رصيد المحفظة
- `GET /api/areas` - جلب قائمة المناطق
- `POST /api/newAdd` - نشر الإعلان

**المميزات**:
- ✅ التحقق من الاشتراك في الباقات (type 1.4)
- ✅ عرض الباقات النشطة للمستخدم
- ✅ زر "الاشتراك في باقة" إذا لم يكن مشترك
- ✅ عرض رصيد المحفظة
- ✅ اختيار المنطقة (من API)
- ✅ إدخال رقم الهاتف مع validation
- ✅ Loading states لكل العمليات
- ✅ نشر الإعلان بـ type="1.4"

---

## 🎨 التصميم

### NewAddCat (نفس ShareAdds):
```
┌────────────────────────────────────┐
│ [🚗] سيارات                    →  │
└────────────────────────────────────┘
```
- بطاقات أفقية
- Shadow: `shadow-sm hover:shadow-xl`
- Border hover: `border-primary/30`
- خط أسفل عند الـ hover

### NewAddShare (نفس CarPages):
```
┌─────────────────────────────────┐
│ اسم الإعلان (30 حرف)  15/30    │
│ ─────────────────────────────── │
│                                 │
│ الوصف                           │
│ ─────────────────────────────── │
│                                 │
│ السعر (د.ك)                    │
│ ─────────────────────────────── │
│                                 │
│ [📤 ارفع صور]                   │
│                                 │
│ [التالي]                        │
└─────────────────────────────────┘
```

### NewAddCer:
```
┌─────────────────────────────────┐
│ ملخص الإعلان                    │
│                                 │
│ الفئة: سيارات                  │
│ ──────────────                  │
│ العنوان: تويوتا كامري...       │
│ ──────────────                  │
│ السعر: 5000 د.ك                │
│ ──────────────                  │
│ الصور: [🖼️] [🖼️] [🖼️]         │
│                                 │
│ [نشر الإعلان الآن]              │
└─────────────────────────────────┘
```

---

## 📡 API Integration

### 1. التحقق من الباقات

**URL**: `GET /api/subscription-packages?type[]=1&type[]=4`

**الاستخدام**: التحقق من اشتراك المستخدم في باقة إعلانات تجارية

**Response**:
```json
{
  "status": true,
  "data": [
    {
      "id": 123,
      "package": {
        "name_ar": "باقة الأعمال",
        "name_en": "Business Package",
        "price": "10",
        "adv_num": 50,
        "period": 30,
        "details": "...",
        "img": "..."
      }
    }
  ]
}
```

---

### 2. التحقق من رصيد المحفظة

**URL**: `GET /api/wallet`

**الاستخدام**: الحصول على رصيد محفظة المستخدم

**Response**:
```json
{
  "status": true,
  "data": {
    "balance": "25.500"
  }
}
```

---

### 3. جلب الباقات التجارية المتاحة

**URL**: `POST /api/packages`  
**Body**: `type[]=1&type[]=4` (query string format)

**الاستخدام**: جلب جميع الباقات التجارية المتاحة للاشتراك

**Request**:
```javascript
await postForm('/api/packages', 'type[]=1&type[]=4')
```

**Response**:
```json
{
  "status": true,
  "msg": "",
  "data": [
    {
      "id": 1,
      "name": "اعلان تجاري 1",
      "adv_number": 1,
      "period": 19,
      "price": 2,
      "type": 1,
      "img": "https://lay6ofk.com/uploads/packages/...",
      "color": "#fb0404",
      "details": ""
    },
    {
      "id": 14,
      "name": "تجاري VIP جدا",
      "adv_number": 1,
      "period": 10,
      "price": 10,
      "type": 4,
      "img": "",
      "color": "",
      "details": "..."
    }
  ]
}
```

---

### 4. جلب قائمة المناطق

**URL**: `GET /api/areas`

**الاستخدام**: جلب جميع المناطق المتاحة

**Response**:
```json
{
  "status": true,
  "data": [
    { "id": 1, "name": "الكويت" },
    { "id": 2, "name": "حولي" },
    { "id": 3, "name": "الفروانية" }
  ]
}
```

---

### 4. نشر الإعلان

**URL**: `POST /api/newAdd`  
**Content-Type**: `multipart/form-data`

**Request Body**:
```javascript
FormData {
  name: string,           // اسم الإعلان (30 حرف)
  description: string,    // الوصف
  price: string,          // السعر
  whatsapp: string,       // رقم الواتساب
  cat_id: string,         // معرف الفئة
  type: "1.4",           // نوع الإعلان التجاري
  area_id: string,        // معرف المنطقة
  place_id: string,       // معرف المكان (نفس area_id)
  phone: string,          // رقم الهاتف
  imgs[0]: File,         // الصورة الأولى
  imgs[1]: File,         // الصورة الثانية
  ...                    // حتى imgs[4]
}
```

**مثال Request**:
```javascript
const formData = new FormData();
formData.append('name', 'تويوتا كامري 2020 للبيع بحالة');
formData.append('description', 'سيارة بحالة ممتازة جداً...');
formData.append('price', '5000');
formData.append('whatsapp', '+96512345678');
formData.append('cat_id', '95');
formData.append('type', '1.4');  // ← إعلان تجاري
formData.append('area_id', '1');
formData.append('place_id', '1');
formData.append('phone', '0512345678');
formData.append('imgs[0]', file1);
formData.append('imgs[1]', file2);
formData.append('imgs[2]', file3);
```

**Expected Response**:
```json
{
  "status": true,
  "message": "تم نشر الإعلان بنجاح",
  "data": {
    "id": 12345,
    "name": "تويوتا كامري 2020 للبيع بحالة",
    ...
  }
}
```

---

## ✅ Validation Rules

### اسم الإعلان:
- ✅ **30 حرف بالضبط** - لا أكثر ولا أقل
- ✅ **بدون أرقام** - فقط حروف عربية/إنجليزية
- ✅ عداد أحرف مباشر: `15/30`
- ✅ رسائل خطأ واضحة

### الحقول الأخرى:
- ✅ الوصف: مطلوب وليس فارغ
- ✅ السعر: رقم موجب
- ✅ واتساب: رقم هاتف مطلوب
- ✅ الصور: على الأقل صورة واحدة (حتى 5)

---

## 🔗 Routes في App.js

```javascript
// Imports
const NewAddCat = lazy(() => import("./components/NewAdd/NewAddCat"));
const NewAddShare = lazy(() => import("./components/NewAdd/NewAddShare"));
const NewAddCer = lazy(() => import("./components/NewAdd/NewAddCer"));

// Routes
{ path: "new-add-cat", element: <NewAddCat /> },
{ path: "new-add-share", element: <NewAddShare /> },
{ path: "new-add-cer", element: <NewAddCer /> },
```

---

## 💾 LocalStorage Usage

### new_add_draft
يتم حفظه تلقائياً أثناء الكتابة في NewAddShare:
```javascript
{
  title: "...",
  description: "...",
  price: "5000",
  whatsapp: "+965...",
  images_count: 3,
  categoryId: "95",
  categoryName: "سيارات"
}
```

### new_add_complete
يتم حفظه عند الضغط على "التالي":
```javascript
{
  name: "...",
  description: "...",
  price: "5000",
  whatsapp: "+965...",
  cat_id: "95",
  category_name: "سيارات",
  images_count: 3,
  timestamp: "2025-10-07T..."
}
```

---

## ⚡ Performance Optimizations

### 1. useCallback للـ functions
```javascript
const handleInputChange = useCallback(...)
const handleImageChange = useCallback(...)
const validateTitle = useCallback(...)
```

### 2. useMemo للـ computed values
```javascript
const isFormValid = useMemo(...)
const sortedCategories = useMemo(...)
```

### 3. Cleanup للـ object URLs
```javascript
useEffect(() => {
  return () => {
    previewImages.forEach(img => URL.revokeObjectURL(img.preview))
  }
}, [])
```

---

## 🎯 المميزات الكاملة

### ✅ UI/UX
- نفس تصميم Share pages بالضبط
- Responsive على جميع الأجهزة
- Hover effects احترافية
- Loading states في كل خطوة
- Error handling شامل

### ✅ Validation
- Validation مباشر على كل حقل
- رسائل خطأ واضحة ومفيدة
- عداد أحرف للعنوان
- منع الأرقام في العنوان

### ✅ Images
- رفع حتى 5 صور
- Drag & drop support
- معاينة مباشرة
- إمكانية الحذف
- Cleanup تلقائي للـ URLs

### ✅ Data Management
- حفظ تلقائي في localStorage
- استرجاع البيانات عند العودة
- تنظيف البيانات بعد النشر
- Session management

### ✅ API Integration
- FormData multipart/form-data
- رفع صور متعددة
- Error handling
- Loading states
- Success/Failure messages

---

## 📊 ملخص الملفات

| الملف | الدور | المسار | API |
|------|------|--------|-----|
| `NewAddCat.jsx` | اختيار الفئة | `/new-add-cat` | `/api/adv_home?country_id=1` |
| `NewAddShare.jsx` | إدخال البيانات | `/new-add-share` | - |
| `NewAddCer.jsx` | مراجعة ونشر | `/new-add-cer` | `POST /api/newAdd` |
| `BusinessPackages.jsx` | الباقات التجارية | `/business-packages` | `POST /api/packages` |
| `Advertising.jsx` | زر البدء | - | - |
| `App.js` | Routes | - | - |

---

## 🚀 الحالة النهائية

✅ **جاهز للاستخدام الكامل**
- جميع الخطوات تعمل
- التصميم مطابق لـ Share بالضبط
- API جاهز للإرسال مع type="2.4"
- Validation كامل
- Error handling موجود
- بدون أي أرقام ثابتة

---

## 🔐 نوع الإعلان

**type = "1.4"** (ثابت)
- يشير إلى أن الإعلان من نوع **"إعلان تجاري"**
- يتم إرساله مع كل إعلان إلى `/api/newAdd`
- يساعد الـ backend في تصنيف الإعلانات
- **ملاحظة**: `1.4` للإعلانات التجارية (ليس `0.2` للإعلانات العادية)

**تفاصيل النوع**:
- الرقم الأول (`1`): نوع رئيسي
- الرقم الثاني (`4`): نوع فرعي
- عند التحقق من الباقات، يتم تقسيمه إلى: `type[]=1&type[]=4`

---

## 💳 نظام الباقات والدفع

### التحقق من الاشتراك

قبل نشر الإعلان، يتحقق النظام من:

1. **الباقات النشطة**:
   - يستعلم عن `/api/subscription-packages?type[]=1&type[]=4`
   - إذا وجد باقة نشطة → يعرضها للمستخدم ✅
   - إذا لم يجد → يعرض زر "الاشتراك في باقة" ⚠️

2. **رصيد المحفظة**:
   - يستعلم عن `/api/wallet`
   - يعرض الرصيد الحالي
   - إذا كان الرصيد > 0 → يمكن الدفع من المحفظة ✅
   - إذا كان الرصيد = 0 → يحتاج شحن أو فيزا ⚠️

### حالات الدفع

#### حالة 1: لديه باقة نشطة
```
✅ لديك باقة نشطة
└─ يمكن نشر الإعلان مباشرة
```

#### حالة 2: ليس لديه باقة + رصيد كافي
```
⚠️ لا توجد باقة نشطة
💰 رصيد المحفظة: 25.5 د.ك ✅
└─ [الاشتراك في باقة] → الدفع من المحفظة
```

#### حالة 3: ليس لديه باقة + رصيد غير كافي
```
⚠️ لا توجد باقة نشطة
💰 رصيد المحفظة: 0 د.ك ❌
└─ [الاشتراك في باقة] → اختيار طريقة الدفع (فيزا/شحن)
```

---

## 📊 ملخص APIs المستخدمة

| # | API | Method | Body | الوظيفة |
|---|-----|--------|------|----------|
| 1 | `/api/adv_home?country_id=1` | GET | - | جلب الفئات |
| 2 | `/api/subscription-packages?type[]=1&type[]=4` | GET | - | التحقق من الباقات النشطة |
| 3 | `/api/packages` | POST | `{ type: [1, 4] }` | جلب الباقات التجارية المتاحة |
| 4 | `/api/wallet` | GET | - | رصيد المحفظة |
| 5 | `/api/areas` | GET | - | قائمة المناطق |
| 6 | `/api/newAdd` | POST | FormData | نشر الإعلان |

---

**تاريخ الإنشاء**: أكتوبر 2025  
**آخر تحديث**: أكتوبر 2025  
**الحالة**: ✅ مكتمل وجاهز

