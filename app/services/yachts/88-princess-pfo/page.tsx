import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("88-princess-pfo");

export { generateMetadata };
export default YachtProductPage;
