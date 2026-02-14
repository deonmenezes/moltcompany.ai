import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side admin client (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export type User = {
  id: string
  email: string
  name: string | null
  google_id: string | null
  stripe_customer_id: string | null
  created_at: string
}

export type Instance = {
  id: string
  user_id: string
  ec2_instance_id: string | null
  public_ip: string | null
  status: string
  model_provider: string | null
  model_name: string | null
  channel: string
  telegram_bot_token: string | null
  llm_api_key: string | null
  gateway_token: string | null
  region: string
  created_at: string
  last_health_check: string | null
}

export type Subscription = {
  id: string
  user_id: string
  stripe_subscription_id: string | null
  status: string | null
  current_period_end: string | null
  created_at: string
}
