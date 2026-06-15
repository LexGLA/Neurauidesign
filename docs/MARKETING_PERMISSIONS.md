# Marketing Agent — Permissions & Guardrails

پیاده‌سازی در `services/marketing/permissions.ts` و اعمال در UI از طریق `confirmSensitive()` (در `marketing-context.tsx`).

## سطوح اختیار AI
| سطح | کلید |
|-----|------|
| خاموش | `off` |
| فقط پیشنهاد | `suggest-only` |
| اجرا با تأیید مدیر | `execute-with-approval` (**پیش‌فرض**) |
| اجرای خودکار | `autonomous` |

با سطح پیش‌فرض، عملیات حساس **هرگز** بدون تأیید انسانی توسط AI اجرا نمی‌شوند. `aiCanExecute(op)` فقط در سطح `autonomous` برای عملیات حساس `true` برمی‌گرداند.

## عملیات نیازمند تأیید انسانی
- ارسال پیام انبوه (`bulk-message`)
- انتشار کمپین (`publish-campaign`)
- افزایش بودجه (`increase-budget`)
- توقف کمپین (`pause-campaign`)
- تغییر گسترده سگمنت (`segment-major-change`)
- ارسال گزارش خارجی (`external-report`)
- حذف لید (`delete-lead`)
- تغییر مهم Lead Score (`lead-score-major-change`)
- اجرای خودکار کمپین (`autonomous-campaign`)
- ارسال پیام حساس (`sensitive-message`)

## رفتار UI
هر اقدام حساس (انسانی یا پیشنهاد AI) پیش از اجرا یک **Confirmation Modal** نمایش می‌دهد. اقدامات پیشنهادی AI علاوه بر این در **مرکز تأیید** (`mktApprovalsScreen`) با تأیید/رد/ویرایش و ثبت **Log** مدیریت می‌شوند.

## Guardrail کلیدی
AI نباید بدون تأیید، بودجه را تغییر دهد یا کمپین را منتشر کند — این دو در UI همیشه از مسیر `confirmSensitive` عبور می‌کنند.
