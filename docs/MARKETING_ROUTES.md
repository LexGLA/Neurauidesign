# Marketing Agent — Routes

ناوبری مبتنی بر state است (`adminScreen` در `app-context.tsx`) نه react-router. Routeهای منطقی پیشنهادی در کنار Screen ID آورده شده‌اند.

| Route منطقی | Screen ID | نوع | دسترسی |
|-------------|-----------|-----|--------|
| `/marketing/conversations` | `mktConversationsScreen` | جدید | Footer: گفتگو |
| `/marketing/leads` | `mktLeadsScreen` | اصلاح‌شده | Footer: لیدها |
| `/marketing/leads/:id` | Modal جزئیات لید | جدید | کلیک روی کارت لید |
| `/marketing/campaigns` | `campaignScreen` | اصلاح‌شده | Footer: کمپین‌ها |
| `/marketing/campaigns/:id` | Modal جزئیات کمپین (۶ تب) | جدید | کلیک روی کارت کمپین |
| `/marketing/audiences` | `mktSegmentScreen` | اصلاح‌شده (نام «بازار»→«مخاطبان») | Footer: مخاطبان |
| `/marketing/audiences/:id` | Modal جزئیات سگمنت | جدید | کلیک روی کارت سگمنت |
| `/marketing/performance` | `mktPerformanceScreen` | اصلاح‌شده | Footer: عملکرد |
| `/marketing/approvals` | `mktApprovalsScreen` | جدید | از صفحه گفتگو / دکمه داخلی |
| `/marketing/calendar` | `mktCalendarScreen` | جدید | از صفحه کمپین‌ها |

جزئیات لید/کمپین/سگمنت/رویداد به‌صورت Modal (الگوی موجود اپ) پیاده شده‌اند تا بدون افزودن آیتم Footer قابل دسترسی باشند.
