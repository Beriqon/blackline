import {loadSetting,saveRow} from "./workspace-store";
export const WORKSPACE_SETTINGS_KEY="blackline-workspace-settings-v1";
export const DEFAULT_WORKSPACE_SETTINGS={name:"Blackline team",email:"",businessName:"Blackline Concierge",contactEmail:"Blackline235@gmail.com",phone:"+1 (786) 684-0345",instagram:"@blackline_concierge",defaultSource:"WhatsApp"};
export type WorkspaceSettings=typeof DEFAULT_WORKSPACE_SETTINGS;
let current:WorkspaceSettings={...DEFAULT_WORKSPACE_SETTINGS};
export function readWorkspaceSettings():WorkspaceSettings{return {...current};}
export async function loadWorkspaceSettings(){current=await loadSetting("workspace",DEFAULT_WORKSPACE_SETTINGS);return {...current};}
export async function saveWorkspaceSettings(settings:WorkspaceSettings){await saveRow("site_settings","workspace",settings);await saveRow("site_settings","business",{businessName:settings.businessName,contactEmail:settings.contactEmail,phone:settings.phone,instagram:settings.instagram});current={...settings};}
