import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("166-trinity");

export { generateMetadata };
export default YachtProductPage;
