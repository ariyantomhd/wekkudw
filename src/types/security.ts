// src/types/security.ts
import { ModuleKey, ThreatType, ThreatSeverity, SecurityAction, SystemStatus } from './enums';

export interface SecurityEventLog {
  id: string;
  user_id: string | null;
  event_type: string;
  ip_address: string;
  created_at: string;
}

export interface SecurityThreatLog {
  id: string;
  threat_type: ThreatType;
  severity: ThreatSeverity;
  source_ip: string;
  module_key: ModuleKey;
  action_taken: SecurityAction;
  created_at: string;
}

export interface SystemModuleConfig {
  id: string;
  module_key: ModuleKey;
  status: SystemStatus;
  updated_at: string;
}
