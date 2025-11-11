export interface Student {
  id: string;
  name: string;
  points: number;
  achievements: string[];
}

export interface ClassRoom {
  id: string;
  name: string;
  students: Student[];
}
