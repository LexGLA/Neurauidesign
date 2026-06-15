# Marketing Agent — API Contract

Base: `/api/marketing`. این Contractها توسط `marketing.api.ts` پیاده‌سازی می‌شوند (در حال حاضر Stub؛ نیازمند Backend واقعی). در حالت Mock، `marketing.mock.ts` همین Interfaceها را با `localStorage` شبیه‌سازی می‌کند.

## گفتگوها
```
GET    /conversations
GET    /conversations/:id
POST   /conversations
POST   /conversations/:id/messages
PATCH  /conversations/:id/read
```
## لیدها
```
GET    /leads
POST   /leads
GET    /leads/:id
PATCH  /leads/:id
DELETE /leads/:id
POST   /leads/:id/notes
POST   /leads/:id/follow-ups
PATCH  /leads/:id/stage
PATCH  /leads/:id/score
GET    /leads/:id/timeline
```
## کمپین‌ها
```
GET    /campaigns
POST   /campaigns
GET    /campaigns/:id
PATCH  /campaigns/:id
POST   /campaigns/:id/publish
POST   /campaigns/:id/pause
POST   /campaigns/:id/resume
POST   /campaigns/:id/duplicate
POST   /campaigns/:id/budget
GET    /campaigns/:id/performance
GET    /campaigns/:id/report
```
## مخاطبان و سگمنت‌ها
```
GET    /audiences
POST   /audiences
GET    /audiences/:id
PATCH  /audiences/:id
POST   /audiences/:id/duplicate
GET    /audiences/:id/overlap
POST   /audiences/:id/campaigns
GET    /personas
POST   /personas
GET    /personas/:id
PATCH  /personas/:id
```
## عملکرد
```
GET    /performance
GET    /performance/channels
GET    /performance/funnel
GET    /performance/audiences
GET    /performance/campaigns
POST   /performance/ai-analysis
POST   /performance/report
```
## تأیید اقدامات AI
```
GET    /approvals
GET    /approvals/:id
POST   /approvals/:id/approve
POST   /approvals/:id/reject
PATCH  /approvals/:id
GET    /approvals/log
```
## تقویم
```
GET    /calendar
POST   /calendar
PATCH  /calendar/:id
DELETE /calendar/:id
```
## AI
```
POST   /assistant/messages
POST   /assistant/design-campaign
POST   /assistant/analyze-campaign
POST   /assistant/suggest-segment
POST   /assistant/generate-persona
POST   /assistant/analyze-lead
POST   /assistant/generate-message
POST   /assistant/performance-report
```
