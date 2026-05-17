import { createYachtProductPage } from "@/lib/yacht-product-page";

const { generateMetadata, default: YachtProductPage } =
  createYachtProductPage("116-pershing-gtx");

export { generateMetadata };
export default YachtProductPage;
