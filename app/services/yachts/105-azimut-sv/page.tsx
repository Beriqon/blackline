import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("105-azimut-sv");

export { generateMetadata };
export default YachtProductPage;
