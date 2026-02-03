export interface ActivityRecord {
  type: "lumosity" | "robo" | "sport" | "valheim" | "civilization" | "simcity" | "factorio" | "pe3d";
  date: string;
  ratedBy?: string;
  points?: number;
  time?: number;
  result?: "win" | "loss";
  role?: "captain" | "player";
  gameStatus?: "ongoing" | "finished";
  matchName?: string;
  teamName?: string;
  opponentTeamName?: string;
  civilizationYear?: number;
  civilizationDefenseYear?: number;
  civilizationProduction1?: string;
  civilizationProduction2?: string;
  civilizationProduction3?: string;
  simcityCitizens?: number;
  simcityHappiness?: number;
  simcityProduction?: string;
  factorioFlasks?: number;
}

export interface SoftSkillRating {
  leadership: number;
  selfControl: number;
  communication: number;
  selfReflection: number;
  criticalThinking: number;
  matchId?: string;
  gameType?: "valheim" | "civilization" | "factorio" | "sport" | "robo" | "lumosity" | "simcity" | "3dphysics";
  date: string;
  ratedBy: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  createdAt?: string;
}

export interface Student {
  id: string;
  name: string;
  points: number;
  achievements: string[];
  activities?: ActivityRecord[];
  softSkills?: SoftSkillRating[];
}

export interface ClassRoom {
  id: string;
  name: string;
  students: Student[];
  responsibleTeacherId?: string;
  games?: ("valheim" | "civilization" | "factorio" | "sport" | "robo" | "lumosity")[];
}

export interface TeamMember {
  studentId: string;
  studentName: string;
  className: string;
  role: "player" | "captain";
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export interface Match {
  id: string;
  gameType: "valheim" | "civilization" | "factorio" | "sport" | "robo";
  team1: Team;
  team2: Team;
  result?: "team1" | "team2";
  date: string;
  completed: boolean;
  createdBy: string;
  scheduledDates?: ScheduledDate[];
  league?: "beginner" | "second" | "first" | "premiere";
}

export interface ScheduledDate {
  id: string;
  date: string;
  time: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "junior";
  createdAt: string;
  username?: string;
  password?: string;
}

export interface AppState {
  teacher: Teacher;
  classes: ClassRoom[];
  matches: Match[];
  attendance: AttendanceRecord[];
  currentView?: 'main' | 'profile' | 'admin';
  activeTab?: string;
}

export interface GlobalData {
  teachers: Teacher[];
  classes: ClassRoom[];
  matches: Match[];
  attendance: AttendanceRecord[];
}