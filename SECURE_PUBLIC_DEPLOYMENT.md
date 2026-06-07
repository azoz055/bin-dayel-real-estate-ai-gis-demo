# النشر الآمن كرابط عام

## أفضل خيار آمن

لا نفتح جهازك مباشرة للإنترنت. ننشر ملفات `dist` فقط على استضافة Static مثل:

1. GitHub Pages
2. Cloudflare Pages
3. Netlify
4. Vercel

بهذا الشكل الزوار يشوفون ملفات HTML/CSS/JS فقط، ولا يوجد Backend ولا قاعدة بيانات ولا منفذ مفتوح على جهازك.

## ماذا أضفت للأمان؟

- لا توجد أسرار أو API keys.
- لا يوجد Backend عام.
- لا يوجد اتصال ببيانات جهازك.
- تم إزالة Google Fonts الخارجي.
- تم إضافة Content Security Policy.
- تم إضافة headers مناسبة لـ Cloudflare/Netlify.
- تم منع iframe embedding عبر frame-ancestors/X-Frame-Options.
- تم تعطيل صلاحيات كاميرا/مايك/موقع/USB عبر Permissions-Policy.

## GitHub Pages

إذا سجلت دخول GitHub CLI أو أعطيتني repo/token، أقدر أنشره كالتالي:

```bash
git init
git add .
git commit -m "initial demo"
gh repo create bin-dayel-real-estate-ai-gis-demo --public --source . --push
```

ثم من إعدادات repo:

Settings > Pages > Source: GitHub Actions

الـ workflow الموجود في `.github/workflows/deploy-pages.yml` يبني وينشر تلقائياً عند كل push.

## Cloudflare Pages

اربط repo أو ارفع dist.

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

## كيف تعدل لاحقاً؟

تعدل الملفات هنا، ثم:

```bash
npm test
npm run build
git add .
git commit -m "update demo"
git push
```

بعدها الموقع العام يتحدث تلقائياً.
