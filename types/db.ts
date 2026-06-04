import { Database } from "./supabase";

export type ServiceCategory = Database["public"]["Enums"]["service_category"];
export type UserProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type JobRequests = Database["public"]["Tables"]["job_requests"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
