# Security Specification & TDD Plan

## 1. Data Invariants
1. **Customer PII Isolation**: A customer profile document `/customers/{customerId}` can only be created, read, or updated by the owning authenticated user (`request.auth.uid == customerId`) or a verified administrator (`isAdmin()`). Customers can never `list` other customers.
2. **Self-Assigned Role Prevention**: Customers creating or updating their profile must keep `role == 'customer'`. Any attempt to set `role: 'admin'` or inject ghost fields is denied.
3. **Admin Authorization Boundary**: Only the verified bootstrapped owner (`request.auth.token.email == 'mis161group8@gmail.com' && request.auth.token.email_verified == true`) or a UID registered in `/admins/{uid}` is recognized as an admin.
4. **Appointment & Quote Ownership**: Quotes and appointments must have `customerId == request.auth.uid` on customer creation. Customers can only `get` and `list` documents where `resource.data.customerId == request.auth.uid`.
5. **Terminal State Locking**: Completed appointments (`status == 'completed'`) cannot be modified or cancelled by customers.
6. **Blocked Slots Integrity**: Public visitors can read `/blockedSlots` (which contain no PII) to render unavailable times in the booking UI, while only verified admins can create, update, or delete `/blockedSlots`.
7. **Temporal Integrity**: `createdAt` is immutable and equals `request.time` on creation; `updatedAt` equals `request.time` on creation and update.
8. **Query Enforcement**: Every `allow list` validates `resource.data` directly without `get()`/`exists()` lookups inside `list` (using `isBootstrappedAdmin()` for admin list access).

## 2. The "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Customer Profile Read**: Anonymous client attempts `get /customers/cust_123`.
2. **Cross-Customer Profile Read**: Authenticated Customer A (`uid_a`) attempts `get /customers/uid_b`.
3. **Blanket Customer Directory Scrape**: Customer A (`uid_a`) attempts `list /customers`.
4. **Privilege Escalation on Profile Create**: Customer A creates `/customers/uid_a` with `{ role: 'admin', ... }`.
5. **Shadow Update / Ghost Field**: Customer A updates `/customers/uid_a` adding `{ isVipAdmin: true }`.
6. **Unverified Email Spoof**: User with `{ email: 'mis161group8@gmail.com', email_verified: false }` attempts admin action (`create /blockedSlots/b1`).
7. **Unauthorized Block Slot Creation**: Standard customer attempts `create /blockedSlots/b1`.
8. **Cross-Customer Appointment Spoof**: Customer A creates `/appointments/apt_1` with `{ customerId: 'uid_b', ... }`.
9. **Cross-Customer Quote List**: Customer A attempts `list /quotes` without scoping to `where('customerId', '==', 'uid_a')`.
10. **Terminal Appointment Tamper**: Customer A attempts to change `status: 'completed'` appointment back to `'scheduled'` or alter `price`.
11. **Resource/ID Poisoning**: Authenticated user sends a 2,000-character document ID `/quotes/<2000-chars>` or oversized 20KB string field.
12. **Payment Ledger Tamper**: Standard customer attempts `create /payments/pay_1` or `read /payments/pay_1`.
