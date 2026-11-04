export function isLocalDashboardPreview(){
 return process.env.NODE_ENV==="development"&&typeof window!=="undefined"&&["localhost","127.0.0.1"].includes(window.location.hostname)&&sessionStorage.getItem("blackline-readonly-preview")==="1";
}
