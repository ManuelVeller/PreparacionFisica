export type UserRole = 'profe' | 'alumno';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  rememberMe?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description: string;
  photoUrl?: string;
  videoUrl?: string; // YouTube URL
  createdAt: string;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  targetReps: string;
  suggestedWeightKg?: number;
  notes?: string;
}

export interface Routine {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  title: string;
  notes?: string;
  paperScanUrl?: string; // Optimizada con Sharp
  exercises: RoutineExercise[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  goal: string;
  injuries?: string;
  joinedDate: string;
  phone?: string;
}

export interface SetLog {
  round: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface ExerciseLogRecord {
  exerciseId: string;
  exerciseName: string;
  rounds: SetLog[];
}

export interface WorkoutDayLog {
  id: string;
  routineId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  records: ExerciseLogRecord[];
  studentFeedback?: string;
  completed: boolean;
}
