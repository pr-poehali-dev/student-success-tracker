export interface ActivityRecord {
  type: "lumosity" | "robo" | "sport" | "valheim" | "civilization" | "simcity" | "factorio" | "pe3d";
  date: string;
  points?: number;
  time?: number;
  result?: "win" | "loss";
  role?: "captain" | "player";
  gameStatus?: "ongoing" | "finished";
  matchName?: string;
  teamName?: string;
  opponentTeamName?: string;
}

export interface Student {
  id: string;
  name: string;
  points: number;
  achievements: string[];
  activities?: ActivityRecord[];
}

export interface ClassRoom {
  id: string;
  name: string;
  students: Student[];
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
}

export interface AppState {
  teacher: Teacher;
  classes: ClassRoom[];
  matches: Match[];
}