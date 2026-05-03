/**
 * Contact page — Custom package / trip builder (WhatsApp builder).
 * Must match the `SectionReveal` `id` in `app/contact/page.tsx`.
 */
export const CONTACT_TRIP_BUILDER_SECTION_ID = "whatsapp-trip-builder" as const;

export const CONTACT_TRIP_BUILDER_HREF =
  `/contact#${CONTACT_TRIP_BUILDER_SECTION_ID}` as const;
