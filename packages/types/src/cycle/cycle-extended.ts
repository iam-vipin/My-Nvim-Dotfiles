export type TCycleConfig = {
  id: string;
  title: string;
  cycle_duration: number;
  cooldown_period: number;
  start_date: string | null;
  number_of_cycles: number;
  is_auto_rollover_enabled: boolean;
  is_active: boolean;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string | null;
};
