import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("97-san-lorenzo");

export { generateMetadata };
export default YachtProductPage;
