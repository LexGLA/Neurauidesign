# عامل بازاریاب هوشمند (Marketing Agent) — Neura

مرکز عملیات بازاریابی هوشمند پروژه Neura. این سند نمای کلی معماری Frontend عامل بازاریاب را شرح می‌دهد.

## دامنه (Scope)
فقط عامل «بازاریاب» را پوشش می‌دهد. سایر عامل‌ها (منشی، مالی/اداری، فروش/صندوقدار، خرید/تدارکات)، پنل شخصی، Admin و Super Admin تغییری نکرده‌اند.

## صفحات
| صفحه | Screen ID | کامپوننت |
|------|-----------|----------|
| گفتگوها (Inbox عملیاتی) | `mktConversationsScreen` | `MktConversationsScreen` |
| لیدها (لیست + پایپ‌لاین) | `mktLeadsScreen` | `MktLeadsScreen` |
| کمپین‌ها | `campaignScreen` | `MarketingCampaignScreen` |
| مخاطبان و سگمنت‌ها | `mktSegmentScreen` | `MktSegmentScreen` |
| عملکرد | `mktPerformanceScreen` | `MktPerformanceScreen` |
| مرکز تأیید اقدامات AI | `mktApprovalsScreen` | `MktApprovalsScreen` |
| تقویم بازاریابی | `mktCalendarScreen` | `MktCalendarScreen` |

## Footer (موبایل) — پنج آیتم
گفتگو · لیدها · کمپین‌ها · **مخاطبان** · عملکرد
(«بازار» به «مخاطبان» تغییر یافت.)
مرکز تأیید و تقویم از طریق CTA/دکمه‌های داخلی قابل دسترسی‌اند (بدون افزودن آیتم Footer).

## معماری داده
```
UI (screens)  →  useMarketing() (marketing-context.tsx)
              →  marketingService (services/marketing/marketingService.ts)
              →  mock | api   (marketing.mock.ts / marketing.api.ts)
              →  mocks/marketing/*.mock.ts (seed + scenarios)
```
- هیچ Mock Dataای داخل کامپوننت‌ها Hard-code نشده است.
- در حالت Mock، تغییرات در `localStorage` ذخیره می‌شوند و پس از Refresh باقی می‌مانند.
- انتخاب حالت با `VITE_MARKETING_API_MODE` (`mock` | `real`، پیش‌فرض `mock`).
- در Production اگر حالت Mock باشد، Startup با خطا متوقف می‌شود (بدون نشت داده ماک به Production).
- در حالت Real هیچ Fallback خاموش به Mock وجود ندارد (همه متدها تا اتصال Backend خطا می‌دهند).

## State Machine
هر مجموعه داده وضعیت `loading / success / empty / error / offline / permission-denied` دارد؛ عملیات‌ها `saving → saved/failed` را با Toast نمایش می‌دهند. کامپوننت `StateGate` (marketing-ui.tsx) رندر مناسب هر وضعیت (Skeleton/Empty/Error+Retry) را انجام می‌دهد.

## دستیار AI شناور
عنوان «بازاریاب هوشمند من» با Quick Actionهای متناسب با صفحه فعلی (در `floating-mic-fab.tsx` + `MKT_QUICK_ACTIONS`).
