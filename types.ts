export enum Mode {
  FIRE_FIGHT = 'FIRE_FIGHT',
  SOP = 'SOP',
  WEEKLY_BRIEF = 'WEEKLY_BRIEF'
}

export enum Tone {
  FORMAL = 'Formal',
  FRIENDLY = 'Friendly',
  CASUAL = 'Casual'
}

export interface StartupProfile {
  name: string;
  description: string;
  industry: string;
  teamSize: string;
  tone: Tone;
}

export interface OpsRequest {
  profile: StartupProfile;
  mode: Mode;
  rawInput: string;
  extraInstructions?: string;
}
