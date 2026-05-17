import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("96-sunseeker");

export { generateMetadata };
export default YachtProductPage;
