# Security Architecture & Eight Pillars Specification

## 1. Data Invariants
1. **Default Deny**: Unmatched Firestore paths are denied by default.
2. **Verified Email Mandate**: All client-initiated writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **Role Isolation**: `admins/{uid}` grants admin access (`isBootstrappedAdmin()` or `exists(/admins/{uid})`); `staff/{uid}` grants technician access (`exists(/staff/{uid})`). Customers cannot create/modify `/admins` or `/staff` or escalate `role` inside `/customers/{uid}`.
4. **PII Isolation**: `/customers/{uid}`, `/quotes/{quoteId}`, `/appointments/{appointmentId}`, `/payments/{paymentId}`, `/adminNotifications/{id}` are never readable by unrelated customers. Technicians can only read/update appointments where `technicianId == auth.uid` or `technicianEmail.lower() == auth.token.email.lower()`.
5. **Double-Booking Prevention (`/slotAvailability/{slotKey}`)**: Publicly readable without any customer PII (`id`, `date`, `timeSlot`, `bookedCount`, `appointmentIds`, `bookedTechIds`, `updatedAt`). Verified users mutate it only by +/-1 appointment count per slot transaction without changing `date` or `timeSlot`.
6. **Technician Dialogue Scoping (`/dialogueMessages` & `/dialogueThreads`)**: Technicians can only read/list messages where `request.auth.uid in resource.data.assignedTechIds` or `request.auth.token.email.lower() in resource.data.assignedTechEmails`, and can only create replies on threads whose `/dialogueThreads/{threadId}` lists them as an assigned technician (or `isAdmin()`). Unrelated customer conversations are never exposed.
7. **Quote Photo Size Limits**: Quote `photos` array is bounded to `<= 5` items, each `<= 160000` characters, keeping total document payload safely below Firestore's 1MB limit.
8. **Immutable Ownership & Timestamps**: `createdAt == request.time` on create; `createdAt`, `id`, and `customerId` are immutable on update; `updatedAt == request.time` on update.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated read of `/customers/{uid}` -> Denied (`isSignedIn()` false).
2. Customer A updating `/customers/{customerB_uid}` -> Denied (`request.auth.uid != customerId` and not `isAdmin()`).
3. Customer A creating `/customers/{uid}` with `role: "admin"` -> Denied (`data.role == 'customer'`).
4. Customer A sending unverified email account write to `/quotes/{id}` -> Denied (`email_verified == true` required).
5. Shadow-field injection (`isVerified: true`) on `/quotes/{id}` -> Denied (`hasOnly(...)` rejects ghost keys).
6. Resource-poisoning 500-char doc ID on `/appointments/{poisonId}` -> Denied (`isValidId` <= 128 chars).
7. Customer A listing `/appointments` without filtering by `customerId == auth.uid` -> Denied (`allow list` enforces `resource.data.customerId == request.auth.uid`).
8. Customer A updating `price` or `paymentStatus` on `/appointments/{id}` -> Denied (Tier 2 enforces `incoming().price == existing().price && incoming().paymentStatus == existing().paymentStatus`).
9. Technician B reading `/appointments/{apptForTechA}` -> Denied (`technicianId != auth.uid && technicianEmail != auth.token.email`).
10. Technician B reading `/dialogueMessages` of unassigned Customer C -> Denied (`auth.uid` not in `assignedTechIds` and email not in `assignedTechEmails`).
11. Non-admin updating `/siteConfig/business` -> Denied (`isAdmin()` required).
12. Customer uploading 6 photos or a >200KB photo in `/quotes/{id}` -> Denied (`isValidPhotoList()` enforces count <= 5 and per-item size <= 160000).
