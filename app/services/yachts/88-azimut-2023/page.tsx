import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("88-azimut-2023");

export { generateMetadata };
export default YachtProductPage;
