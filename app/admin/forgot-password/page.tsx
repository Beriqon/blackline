import {AdminAccountPage} from "@/components/admin-account-page";
export const metadata={title:"Forgot password — Blackline",robots:{index:false,follow:false},referrer:"no-referrer" as const};
export default function ForgotPasswordPage(){return <AdminAccountPage mode="recover"/>;}
