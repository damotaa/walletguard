// supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hcmxccuewxvibmnjtxyx.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjbXhjY3Vld3h2aWJtbmp0eHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1NTQ2MDQsImV4cCI6MjA1ODEzMDYwNH0.DhaXmhlpV6OslOQT-r_5a0CZu-thtM3FQ3G8aC8KreI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
