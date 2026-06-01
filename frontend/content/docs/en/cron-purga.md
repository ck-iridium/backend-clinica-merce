---
id: cron-purga
title: Unconfirmed Booking Slot Cleanup
---
# Auto Cleanup of Unfinished Bookings

What happens if a user selects an open slot on your booking website but closes their browser tab before filling in their contact details or processing their card payment? ProBookia blocks that slot from being held indefinitely.

---

### Smart Slot Revalidation

To ensure your clinical schedules are never blocked by abandoned page checkouts, our engine runs a dynamic cleanup routine:

1. **Temporary Hold**: The moment a user clicks on an open slot, the system marks the slot as "Verification Pending".
2. **30-Minute Checkout Timer**: The engine gives the user **30 minutes** to complete their booking, verify email instructions, or process their payment.
3. **Automated Slot Release**: If 30 minutes pass without confirmation, the system **automatically purges** the pending ticket, instantly opening the slot back to the public.
