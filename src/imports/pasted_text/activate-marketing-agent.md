بر اساس طراحی و Preview تأییدشده مرحله قبل، تمام صفحات Agent «بازاریاب هوشمند» پروژه Neura را فعال و قابل‌تست کن.

در این مرحله هیچ تغییر عمده بصری ایجاد نکن. تمرکز فقط روی عملکرد، Routeها، CTAها، Stateها، Mock Service، API Contract و تست است.

## Scope قطعی

فقط Agent بازاریاب را تغییر بده.

پنل سایر Agentها، پنل شخصی، Admin و Super Admin نباید تغییر کنند.

---

# ۱. فعال‌سازی کامل CTAها

تمام دکمه‌ها، Cardها، Tabها، فیلترها و اکشن‌ها باید قابل‌کلیک باشند.

هیچ لینک خراب، صفحه خالی یا دکمه نمایشی بدون رفتار باقی نماند.

## گفتگو

* گفتگوی جدید
* پاسخ
* تماس
* مشاهده جزئیات
* تأیید اقدام AI
* رد اقدام AI
* ویرایش پیشنهاد AI

## لیدها

* افزودن لید
* ویرایش لید
* حذف لید
* تماس
* پیام
* ثبت یادداشت
* ایجاد Follow-up
* تغییر مرحله Pipeline
* تغییر Lead Score
* تبدیل به مشتری
* علامت‌گذاری ازدست‌رفته
* مشاهده Timeline

## کمپین‌ها

* ساخت کمپین
* ساخت دستی
* طراحی با AI
* ذخیره Draft
* انتشار
* توقف
* ادامه
* کپی
* ویرایش
* افزایش بودجه
* اتصال سگمنت
* دریافت تحلیل AI
* مشاهده گزارش

## مخاطبان

* ساخت سگمنت
* تعریف دستی
* ساخت با AI
* ویرایش قوانین
* Duplicate
* اتصال به کمپین
* ساخت پرسونا
* تحلیل هم‌پوشانی
* مشاهده جزئیات

## عملکرد

* تغییر بازه زمانی
* تغییر نمودار
* مشاهده جزئیات KPI
* دریافت تحلیل AI
* ساخت گزارش مدیریتی
* Export Placeholder

## Approval Center

* تأیید
* رد
* ویرایش
* مشاهده Preview
* مشاهده دلیل AI
* مشاهده Log

## تقویم

* تغییر View
* افزودن رویداد
* ویرایش
* حذف
* تغییر زمان
* اتصال رویداد به کمپین

---

# ۲. Stateهای ضروری

برای تمام صفحات و عملیات این Stateها را پیاده‌سازی کن:

* Loading
* Skeleton
* Empty
* Error
* Retry
* Success
* Saving
* Saved
* Validation Error
* Unauthorized
* Permission Denied
* Offline
* Disabled
* Confirmation Modal
* Toast
* Draft
* Active
* Paused
* Completed
* Failed
* Pending Approval
* Rejected
* Approved

---

# ۳. Mock Service مستقل

برای Agent بازاریاب یک Mock Repository مستقل بساز.

ساختار پیشنهادی:

```text
src/
  services/
    marketing/
      marketingService.ts
      marketing.mock.ts
      marketing.api.ts

  mocks/
    marketing/
      conversations.mock.ts
      leads.mock.ts
      campaigns.mock.ts
      audiences.mock.ts
      performance.mock.ts
      approvals.mock.ts
      calendar.mock.ts
```

قواعد:

* هیچ Mock Dataای داخل Componentها Hard-code نشود.
* داده‌ها در Mock Mode قابل ذخیره باشند.
* تغییرات پس از Refresh باقی بمانند.
* از LocalStorage یا Mock Repository جداگانه استفاده کن.
* در Production اگر Mock Mode فعال بود Build یا Startup Fail شود.
* در Real API Mode هیچ Silent Fallback به Mock وجود نداشته باشد.

---

# ۴. Mock Scenarioهای قابل‌انتخاب

برای QA سناریوهای کنترل‌شده بساز:

```text
MARKETING_MOCK_SCENARIO=default
MARKETING_MOCK_SCENARIO=empty-leads
MARKETING_MOCK_SCENARIO=high-priority-leads
MARKETING_MOCK_SCENARIO=campaign-failed
MARKETING_MOCK_SCENARIO=campaign-pending-approval
MARKETING_MOCK_SCENARIO=budget-warning
MARKETING_MOCK_SCENARIO=no-conversations
MARKETING_MOCK_SCENARIO=ai-error
MARKETING_MOCK_SCENARIO=network-error
MARKETING_MOCK_SCENARIO=permission-denied
```

---

# ۵. Service Interface

یک Interface مستقل تعریف کن:

```text
MarketingAgentService
```

زیرسرویس‌ها:

```text
MarketingConversationService
LeadService
CampaignService
AudienceService
PersonaService
MarketingPerformanceService
MarketingApprovalService
MarketingCalendarService
MarketingAIService
```

---

# ۶. API Contractهای پیشنهادی

برای تمام APIها Contract اولیه مستند کن.

## گفتگوها

```text
GET    /api/marketing/conversations
GET    /api/marketing/conversations/:id
POST   /api/marketing/conversations
POST   /api/marketing/conversations/:id/messages
PATCH  /api/marketing/conversations/:id/read
```

## لیدها

```text
GET    /api/marketing/leads
POST   /api/marketing/leads
GET    /api/marketing/leads/:id
PATCH  /api/marketing/leads/:id
DELETE /api/marketing/leads/:id
POST   /api/marketing/leads/:id/notes
POST   /api/marketing/leads/:id/follow-ups
PATCH  /api/marketing/leads/:id/stage
PATCH  /api/marketing/leads/:id/score
GET    /api/marketing/leads/:id/timeline
```

## کمپین‌ها

```text
GET    /api/marketing/campaigns
POST   /api/marketing/campaigns
GET    /api/marketing/campaigns/:id
PATCH  /api/marketing/campaigns/:id
POST   /api/marketing/campaigns/:id/publish
POST   /api/marketing/campaigns/:id/pause
POST   /api/marketing/campaigns/:id/resume
POST   /api/marketing/campaigns/:id/duplicate
POST   /api/marketing/campaigns/:id/budget
GET    /api/marketing/campaigns/:id/performance
GET    /api/marketing/campaigns/:id/report
```

## مخاطبان و سگمنت‌ها

```text
GET    /api/marketing/audiences
POST   /api/marketing/audiences
GET    /api/marketing/audiences/:id
PATCH  /api/marketing/audiences/:id
POST   /api/marketing/audiences/:id/duplicate
GET    /api/marketing/audiences/:id/overlap
POST   /api/marketing/audiences/:id/campaigns

GET    /api/marketing/personas
POST   /api/marketing/personas
GET    /api/marketing/personas/:id
PATCH  /api/marketing/personas/:id
```

## عملکرد

```text
GET    /api/marketing/performance
GET    /api/marketing/performance/channels
GET    /api/marketing/performance/funnel
GET    /api/marketing/performance/audiences
GET    /api/marketing/performance/campaigns
POST   /api/marketing/performance/ai-analysis
POST   /api/marketing/performance/report
```

## تأیید اقدامات AI

```text
GET    /api/marketing/approvals
GET    /api/marketing/approvals/:id
POST   /api/marketing/approvals/:id/approve
POST   /api/marketing/approvals/:id/reject
PATCH  /api/marketing/approvals/:id
```

## تقویم

```text
GET    /api/marketing/calendar
POST   /api/marketing/calendar
PATCH  /api/marketing/calendar/:id
DELETE /api/marketing/calendar/:id
```

## AI

```text
POST   /api/marketing/assistant/messages
POST   /api/marketing/assistant/design-campaign
POST   /api/marketing/assistant/analyze-campaign
POST   /api/marketing/assistant/suggest-segment
POST   /api/marketing/assistant/generate-persona
POST   /api/marketing/assistant/analyze-lead
POST   /api/marketing/assistant/generate-message
POST   /api/marketing/assistant/performance-report
```

---

# ۷. Type Definitions

TypeScript Typeهای مستقل تعریف کن:

```text
MarketingConversation
MarketingMessage
Lead
LeadStage
LeadTemperature
LeadScore
LeadTimelineEvent
FollowUp
Campaign
CampaignStatus
CampaignChannel
CampaignGoal
CampaignPerformance
AudienceSegment
AudienceRule
Persona
MarketingKPI
MarketingPerformance
MarketingApproval
MarketingApprovalStatus
MarketingCalendarEvent
MarketingAIAction
MarketingInsight
```

---

# ۸. Permission و Guardrail

برای اکشن‌های حساس Permission تعریف کن.

## عملیات نیازمند تأیید انسانی

* ارسال پیام انبوه
* انتشار کمپین
* افزایش بودجه
* توقف کمپین
* تغییر گسترده سگمنت
* ارسال گزارش خارجی
* حذف لید
* تغییر مهم Lead Score
* اجرای خودکار کمپین
* ارسال پیام حساس

سطوح اختیار AI:

```text
خاموش
فقط پیشنهاد
اجرا با تأیید مدیر
اجرای خودکار
```

به‌صورت پیش‌فرض عملیات حساس روی:

```text
اجرا با تأیید مدیر
```

قرار بگیرند.

AI نباید بدون تأیید، بودجه یا انتشار کمپین را تغییر دهد.

---

# ۹. Responsive

تمام صفحات را در سه حالت تست کن:

```text
Mobile: 360px تا 767px
Tablet: 768px تا 1199px
Desktop: 1200px به بالا
```

## Mobile

* Footer ثابت
* Cardهای عمودی
* Drawer
* Filter Drawer
* عدم نمایش Table عریض
* Kanban Pipeline به‌صورت Tab یا Accordion

## Desktop

* Sidebar یا Header حرفه‌ای
* Grid
* Table
* Kanban
* Dashboard چندستونه
* Calendar کامل
* Detail Page دو یا سه ستونه

---

# ۱۰. تست‌های ضروری

## Navigation

* تمام Footerها
* تمام CTAها
* تمام Tabها
* تمام Back Buttonها
* عدم وجود صفحه خالی
* عدم وجود Route خراب

## Leads

* افزودن لید
* ویرایش
* تغییر مرحله
* تماس
* پیام
* Follow-up
* تبدیل به مشتری
* ازدست‌رفته
* Timeline

## Campaigns

* ساخت دستی
* طراحی با AI
* Draft
* انتشار
* توقف
* ادامه
* Duplicate
* افزایش بودجه
* تحلیل AI
* گزارش

## Audiences

* ساخت سگمنت
* ساخت با AI
* ویرایش قوانین
* اتصال کمپین
* Duplicate
* پرسونا

## Approvals

* تأیید
* رد
* ویرایش
* ثبت Log

## Performance

* تغییر بازه
* تحلیل AI
* گزارش
* Empty State
* Error State

## Responsive

* Mobile
* Tablet
* Desktop

---

# ۱۱. مستندات تحویل

فایل‌های زیر را ایجاد یا تکمیل کن:

```text
docs/MARKETING_AGENT.md
docs/MARKETING_API.md
docs/MARKETING_ROUTES.md
docs/MARKETING_MOCK_SCENARIOS.md
docs/MARKETING_PERMISSIONS.md
docs/MARKETING_KNOWN_ISSUES.md
```

---

# ۱۲. گزارش نهایی

در پایان گزارش بده:

1. Routeهای ساخته‌شده
2. Routeهای اصلاح‌شده
3. فایل‌های ساخته‌شده
4. فایل‌های تغییرکرده
5. Componentهای جدید
6. Service Interfaceها
7. Mock Serviceها
8. Typeها
9. API Contractها
10. Permissionها
11. Guardrailها
12. Mock Scenarioها
13. CTAهای فعال‌شده
14. Stateهای تست‌شده
15. نتیجه تست Mobile
16. نتیجه تست Tablet
17. نتیجه تست Desktop
18. Known Issues
19. بخش‌های نیازمند Backend واقعی
20. درصد تقریبی تکمیل Frontend Agent بازاریاب

در پایان تأیید کن:

* تمام CTAها قابل‌کلیک هستند.
* هیچ صفحه خالی یا Route خراب وجود ندارد.
* Mock Data داخل Componentها Hard-code نشده‌اند.
* Footer Agent بازاریاب پنج آیتم دارد.
* نام «بازار» به «مخاطبان» تغییر کرده است.
* پنل سایر Agentها تغییر نکرده‌اند.
* تمام عملیات حساس AI نیازمند تأیید انسانی هستند.
