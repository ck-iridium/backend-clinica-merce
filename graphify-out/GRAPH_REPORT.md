# Graph Report - .  (2026-05-04)

## Corpus Check
- Large corpus: 132 files · ~597,621 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder, or use --no-semantic to run AST-only.

## Summary
- 540 nodes · 686 edges · 21 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Backend CRUD Operations|Backend CRUD Operations]]
- [[_COMMUNITY_Pydantic Schemas & Data Models|Pydantic Schemas & Data Models]]
- [[_COMMUNITY_Dashboard UI & Content Management|Dashboard UI & Content Management]]
- [[_COMMUNITY_Calendar & Public Booking UI|Calendar & Public Booking UI]]
- [[_COMMUNITY_Database Models & Configuration|Database Models & Configuration]]
- [[_COMMUNITY_Automation & Background Tasks|Automation & Background Tasks]]
- [[_COMMUNITY_Scratch Pad (Old Calendar Logic)|Scratch Pad (Old Calendar Logic)]]
- [[_COMMUNITY_Scratch Pad (Original Logic)|Scratch Pad (Original Logic)]]
- [[_COMMUNITY_Scratch Pad (Pre-Refactor Logic)|Scratch Pad (Pre-Refactor Logic)]]
- [[_COMMUNITY_Auth & Team Management Actions|Auth & Team Management Actions]]
- [[_COMMUNITY_UI Components & Shared Utilities|UI Components & Shared Utilities]]
- [[_COMMUNITY_Services & Categories Management|Services & Categories Management]]
- [[_COMMUNITY_Media Management Backend|Media Management Backend]]
- [[_COMMUNITY_Vouchers & Templates Management|Vouchers & Templates Management]]
- [[_COMMUNITY_Appointments Management Backend|Appointments Management Backend]]
- [[_COMMUNITY_Site Content & User Auth Backend|Site Content & User Auth Backend]]
- [[_COMMUNITY_App Layout & Global Contexts|App Layout & Global Contexts]]
- [[_COMMUNITY_Client Detail & Signature Pad|Client Detail & Signature Pad]]
- [[_COMMUNITY_Calendar V2 UI Components|Calendar V2 UI Components]]
- [[_COMMUNITY_File Uploads & Media Backend|File Uploads & Media Backend]]
- [[_COMMUNITY_Create Appointment Flow|Create Appointment Flow]]

## God Nodes (most connected - your core abstractions)
1. `useFeedback()` - 26 edges
2. `useAuthRole()` - 14 edges
3. `Skeleton()` - 13 edges
4. `getSupabaseAdmin()` - 11 edges
5. `cn()` - 10 edges
6. `get_clinic_settings()` - 9 edges
7. `check_appointment_collision()` - 7 edges
8. `run_auto_migrations()` - 6 edges
9. `fetchData()` - 6 edges
10. `fetchData()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `run_auto_migrations_wrapper()` --calls--> `run_auto_migrations()`  [INFERRED]
  backend/app/main.py → backend/app/utils/migrations.py
- `run_auto_migrations()` --calls--> `ServiceCategory`  [INFERRED]
  backend/app/utils/migrations.py → backend/app/models.py
- `useProfileData()` --calls--> `useFeedback()`  [INFERRED]
  frontend/src/hooks/useProfileData.ts → frontend/src/app/contexts/FeedbackContext.tsx
- `get_clinic_settings()` --calls--> `run_auto_migrations()`  [INFERRED]
  backend/app/crud.py → backend/app/utils/migrations.py
- `get_site_content()` --calls--> `run_auto_migrations()`  [INFERRED]
  backend/app/crud.py → backend/app/utils/migrations.py

## Communities (71 total, 4 thin omitted)

### Community 0 - "Backend CRUD Operations"
Cohesion: 0.05
Nodes (24): check_appointment_collision(), create_appointment(), create_direct_sale(), create_invoice(), create_public_appointment(), create_voucher(), find_or_create_client(), generate_invoice_id() (+16 more)

### Community 1 - "Pydantic Schemas & Data Models"
Cohesion: 0.07
Nodes (49): AppointmentBase, AppointmentCreate, AppointmentResponse, AppointmentUpdate, AvailabilityResponse, ClientBase, ClientCreate, ClientResponse (+41 more)

### Community 2 - "Dashboard UI & Content Management"
Cohesion: 0.07
Nodes (8): useAuthRole(), useProfileData(), fetchData(), handleToggleStatus(), fetchSettings(), handleAddBlock(), handleDeleteBlock(), Skeleton()

### Community 3 - "Calendar & Public Booking UI"
Cohesion: 0.06
Nodes (9): CalendarModals(), TimeScale(), fetchClients(), handleSubmit(), validate(), useFeedback(), useCalendarData(), formatLocalISO() (+1 more)

### Community 4 - "Database Models & Configuration"
Cohesion: 0.09
Nodes (21): force_seed(), seed_admin_user(), Appointment, Client, ClinicSettings, Consent, Invoice, Service (+13 more)

### Community 5 - "Automation & Background Tasks"
Cohesion: 0.08
Nodes (21): cancel_appointment(), cleanup_unverified(), execute_cloud_backup(), get_appointment_for_cancellation(), get_appointment_for_verification(), Endpoint protected by X-Cron-Key.     Cleans up pending_verification appointment, Public endpoint to get basic appointment details for the verification confirmati, Public endpoint with UUID. Verifies appointment and notifies Merce. (+13 more)

### Community 6 - "Scratch Pad (Old Calendar Logic)"
Cohesion: 0.16
Nodes (13): fetchData(), formatLocalISO(), getBlocksForDay(), getDayClosedReason(), handleBlockSubmit(), handleDeleteBlock(), handleStatusChange(), handleSubmit() (+5 more)

### Community 7 - "Scratch Pad (Original Logic)"
Cohesion: 0.16
Nodes (13): fetchData(), formatLocalISO(), getBlocksForDay(), getDayClosedReason(), handleBlockSubmit(), handleDeleteBlock(), handleStatusChange(), handleSubmit() (+5 more)

### Community 8 - "Scratch Pad (Pre-Refactor Logic)"
Cohesion: 0.16
Nodes (13): fetchData(), formatLocalISO(), getBlocksForDay(), getDayClosedReason(), handleBlockSubmit(), handleDeleteBlock(), handleStatusChange(), handleSubmit() (+5 more)

### Community 9 - "Auth & Team Management Actions"
Cohesion: 0.19
Nodes (13): getUserProfile(), getUserRoleByEmail(), updatePasswordAndActivate(), updateUserProfile(), deleteTeamMember(), getTeamMembers(), inviteTeamMember(), updateTeamMemberRole() (+5 more)

### Community 11 - "Services & Categories Management"
Cohesion: 0.2
Nodes (6): fetchCategories(), fetchServices(), handleCancel(), handleCreateCategory(), handleSubmit(), handleUpdateCategory()

### Community 12 - "Media Management Backend"
Cohesion: 0.24
Nodes (12): build_used_urls_map(), bulk_delete_media_files(), BulkDeleteRequest, delete_media_file(), get_media_quota(), get_supabase(), list_all_media(), Returns the total used storage in the media bucket. (+4 more)

### Community 13 - "Vouchers & Templates Management"
Cohesion: 0.19
Nodes (4): fetchData(), handleAssignVoucher(), handleCreateTemplate(), handlePayDebt()

### Community 14 - "Appointments Management Backend"
Cohesion: 0.22
Nodes (4): get_availability(), public_booking(), Returns the list of available time slots for a given date and service.     Used, Landing page booking endpoint.     - Finds or creates the client (deduplication

### Community 19 - "Client Detail & Signature Pad"
Cohesion: 0.29
Nodes (3): SignaturePadModal(), fetchClient(), handlePayDebt()

### Community 21 - "Calendar V2 UI Components"
Cohesion: 0.4
Nodes (3): AppointmentCard(), getStatusColors(), EmptySlot()

### Community 29 - "Create Appointment Flow"
Cohesion: 0.83
Nodes (3): formatLocalISO(), handleBlockSubmit(), handleSubmit()

## Knowledge Gaps
- **28 isolated node(s):** `Returns a naive datetime representing the current local time in Spain.`, `Returns an error string if there's a collision with existing appointments or tim`, `Look up an existing client by email OR phone. Create a new one if not found.`, `Return available time slots (HH:MM strings) for a given date and service.`, `Idempotent public booking: find-or-create client, then create appointment.` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useFeedback()` connect `Calendar & Public Booking UI` to `Dashboard UI & Content Management`, `Scratch Pad (Old Calendar Logic)`, `Scratch Pad (Original Logic)`, `Scratch Pad (Pre-Refactor Logic)`, `Auth & Team Management Actions`, `UI Components & Shared Utilities`, `Services & Categories Management`, `Vouchers & Templates Management`, `App Layout & Global Contexts`, `Client Detail & Signature Pad`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Why does `LoginRequest` connect `Site Content & User Auth Backend` to `Pydantic Schemas & Data Models`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `BulkDeleteRequest` connect `Media Management Backend` to `Pydantic Schemas & Data Models`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `useFeedback()` (e.g. with `CalendarModals()` and `useCalendarData()`) actually correct?**
  _`useFeedback()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Returns a naive datetime representing the current local time in Spain.`, `Returns an error string if there's a collision with existing appointments or tim`, `Look up an existing client by email OR phone. Create a new one if not found.` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend CRUD Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Pydantic Schemas & Data Models` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._