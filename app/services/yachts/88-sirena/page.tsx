import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("88-sirena");

export { generateMetadata };
export default YachtProductPage;
