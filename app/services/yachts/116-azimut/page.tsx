import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("116-azimut");

export { generateMetadata };
export default YachtProductPage;
