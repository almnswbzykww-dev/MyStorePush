---
name: Production persistence
description: Durable storage and deployment constraints for the store.
---

The store must keep mutable settings in PostgreSQL and uploaded images in Replit App Storage; browser localStorage and ephemeral server disk are not authoritative.

**Why:** Production runs may use multiple browsers, Serverless instances, or restarts, so local or process memory would make catalog and branding changes disappear or diverge.

**How to apply:** New mutable store configuration should go through the settings API, and new uploaded media should use the presigned storage flow with only the object path saved in application data.