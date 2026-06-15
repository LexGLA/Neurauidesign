# Marketing Agent — Known Issues & Backend TODO

## Known Issues / محدودیت‌های فعلی
1. **ناوبری state-based:** Routeهای واقعی URL وجود ندارند (هماهنگ با معماری موجود اپ که از react-router برای پنل ادمین استفاده نمی‌کند). Routeها به‌صورت منطقی در `MARKETING_ROUTES.md` مستند شده‌اند.
2. **جزئیات به‌صورت Modal:** صفحات داخلی لید/کمپین/سگمنت به‌جای صفحه مستقل، Modal هستند (الگوی موجود اپ). پس از Mutation، Modal باز ممکن است داده قدیمی نشان دهد تا بسته‌شدن.
3. **AI خروجی Mock:** پاسخ‌های دستیار AI متن‌های ثابت Mock هستند؛ نیازمند مدل واقعی.
4. **نمودارها seed ثابت:** داده نمودارهای روند/کانال از seed نمایشی می‌آیند و با فیلتر زمانی به‌صورت واقعی تغییر نمی‌کنند (فقط KPIها از سرویس می‌آیند).
5. **Persona CRUD محدود:** فقط ایجاد پرسونا پیاده شده (لیست/ساخت)؛ ویرایش کامل پرسونا TODO.
6. **Export گزارش:** Placeholder است (Toast).
7. **بدون drag-and-drop:** تغییر مرحله پایپ‌لاین از طریق دکمه‌های مرحله انجام می‌شود، نه کشیدن کارت.
8. **Offline واقعی:** وضعیت Offline فقط از طریق سناریوی `network-error` شبیه‌سازی می‌شود (بدون تشخیص واقعی اتصال).

## نیازمند Backend واقعی
- تمام Endpointهای `MARKETING_API.md` (`marketing.api.ts` فعلاً Stub است).
- موتور AI واقعی برای `assistant/*`.
- محاسبه واقعی KPI/Funnel/Channel از داده تراکنشی.
- احراز هویت و کنترل دسترسی سمت سرور (UI فقط Guardrail سمت کلاینت دارد).
- ذخیره‌سازی پایدار سمت سرور (فعلاً `localStorage`).

## فعال‌سازی حالت Real
1. `VITE_MARKETING_API_MODE=real`
2. پیاده‌سازی متدهای `marketing.api.ts` با `fetch` مطابق Contract.
3. در Production حالت Mock مجاز نیست (Startup Fail).
