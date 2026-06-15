# Marketing Agent — Mock Scenarios (QA)

سناریوها برای تست کنترل‌شده وضعیت‌ها هستند.

## انتخاب سناریو
- **محیط:** `VITE_MARKETING_MOCK_SCENARIO=<scenario>` در `.env`.
- **زمان اجرا (QA):** از داخل هر صفحه بازاریاب، روی نشان «🧪 سناریو» در هدر بزنید و سناریو را انتخاب کنید (در `localStorage` ذخیره و صفحه Reload می‌شود).

## سناریوها
| سناریو | اثر |
|--------|-----|
| `default` | داده کامل و طبیعی |
| `empty-leads` | لیست لیدها خالی → Empty State |
| `high-priority-leads` | همه لیدها داغ با امتیاز بالا |
| `campaign-failed` | یک کمپین با ROI منفی/متوقف |
| `campaign-pending-approval` | یک اقدام «انتشار کمپین» در صف تأیید |
| `budget-warning` | مصرف بودجه نزدیک سقف + بینش هشدار |
| `no-conversations` | لیست گفتگوها خالی → Empty State |
| `ai-error` | فراخوانی AI خطا می‌دهد → Toast خطا |
| `network-error` | List/Mutation خطای شبکه → Error State + Retry |
| `permission-denied` | عملیات‌های نوشتنی رد می‌شوند → Permission State |

## بازنشانی داده
`resetMockData()` در `services/marketing/marketing.mock.ts` داده ذخیره‌شده سناریوی فعال را پاک می‌کند.

## کلید ذخیره‌سازی
`neura_mkt::<scenario>::<collection>` در `localStorage`.
