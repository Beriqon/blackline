/** Extra line items for the custom package WhatsApp builder only — not shown on service category pages. */
export type CustomPackageMiscAddon = {
  id: string;
  title: string;
  hint: string;
};

export const CUSTOM_PACKAGE_MISC_ADDONS: readonly CustomPackageMiscAddon[] = [
  {
    id: "banana-boat",
    title: "Banana boat rides",
    hint: "Group tow rides — timing with your yacht or beach day",
  },
  {
    id: "paddleboard",
    title: "Paddleboard session",
    hint: "Calm-water boards — Miami Beach area",
  },
  {
    id: "kayak",
    title: "Kayak rental / tour",
    hint: "Singles or tandem — routed with your stay",
  },
  {
    id: "parasailing",
    title: "Parasailing",
    hint: "Shoreline lift — weather & zone permitting",
  },
];
