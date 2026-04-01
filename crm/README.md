# DALA CRM

This is the starter CRM workspace for `crm.dalatechnologies.com`.

Current state:
- Static CRM shell deployed separately from the public website
- Demo login flow for previewing layout and navigation
- Dashboard/account/reporting pages ready for live data wiring

What the colleague should provide next:
- Final CRM information architecture:
  - exact pages required
  - sidebar order
  - user roles
- Data sources to connect:
  - Neon tables to read from
  - any external CRM/business tools
- Authentication direction:
  - internal team login only
  - passwordless / email
  - admin roles
- CRM modules to prioritize:
  - leads
  - brands
  - retailers
  - onboarding
  - account management
  - reporting
- Design/content inputs:
  - final labels
  - required actions per page
  - real KPI definitions

Recommended next implementation phase:
1. Replace demo auth with secure auth
2. Connect dashboard cards to Neon
3. Add lead list, lead detail, and assignment views
4. Add retailer and brand account views
5. Add internal notes/activity timeline
