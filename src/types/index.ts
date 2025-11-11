export interface ActivityRecord {
  type: "lumosity" | "robo" | "sport";
  date: string;
  points?: number;
  time?: number;
  result?: "win" | "loss";
  role?: "captain" | "player";
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