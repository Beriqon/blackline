import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("90-pershing-refit-2025");

export { generateMetadata };
export default YachtProductPage;
