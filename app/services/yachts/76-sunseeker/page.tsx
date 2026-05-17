import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("76-sunseeker");

export { generateMetadata };
export default YachtProductPage;
