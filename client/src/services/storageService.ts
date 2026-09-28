import { User, Student, Exercise, Routine, WorkoutDayLog } from '../types';

const STORAGE_KEYS = {
  USER: 'pf_current_user',
  SAVED_CREDS: 'pf_saved_credentials',
  STUDENTS: 'pf_students',
  EXERCISES: 'pf_exercises',
  ROUTINES: 'pf_routines',
  LOGS: 'pf_workout_logs'
};

// Initial realistic data
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'Martina Rossi',
    email: 'martina@ejemplo.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    goal: 'Aumento de masa muscular y fuerza en tren inferior',
    injuries: 'Molestia leve en menisco derecho (evitar impacto alto)',
    joinedDate: '2026-01-15',
    phone: '+54 9 11 4522-8921'
  },
  {
    id: 'student-2',
    name: 'Lucas Benítez',
    email: 'lucas@ejemplo.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    goal: 'Acondicionamiento físico general y pérdida de grasa',
    injuries: 'Ninguna',
    joinedDate: '2026-02-01',
    phone: '+54 9 11 3190-4421'
  },
  {
    id: 'student-3',
    name: 'Sofía Álvarez',
    email: 'sofia@ejemplo.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    goal: 'Preparación para maratón y fortalecimiento de core',
    injuries: 'Sobrecarga lumbar ocasional',
    joinedDate: '2026-03-10',
    phone: '+54 9 11 6788-1200'
  }
];

const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Sentadilla Trasera con Barra (Back Squat)',
    muscleGroup: 'Piernas / Cuádriceps / Glúteos',
    description: 'Pies al ancho de hombros, bajar rompiendo el paralelo manteniendo el pecho erguido y rodillas alineadas.',
    photoUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=gcNh17Ckjgg',
    createdAt: '2026-01-10'
  },
  {
    id: 'ex-2',
    name: 'Press de Banca Plano (Bench Press)',
    muscleGroup: 'Pecho / Tríceps',
    description: 'Retracción escapular, pies firmes en el suelo, descenso controlado al esternón medio.',
    photoUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    createdAt: '2026-01-12'
  },
  {
    id: 'ex-3',
    name: 'Peso Muerto Rumano (RDL)',
    muscleGroup: 'Isquiosurales / Glúteos / Cadena Posterior',
    description: 'Empujar la cadera hacia atrás manteniendo las rodillas con flexión suave y espalda neutra.',
    photoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    createdAt: '2026-01-15'
  },
  {
    id: 'ex-4',
    name: 'Remo con Mancuerna Unilateral',
    muscleGroup: 'Espalda / Dorsal Ancho',
    description: 'Apoyo en banco, traccionar llevando el codo hacia el bolsillo sin rotar el torso.',
    photoUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=roCP6wCXPqo',
    createdAt: '2026-02-01'
  },
  {
    id: 'ex-5',
    name: 'Plancha Abdominal Activa (Core)',
    muscleGroup: 'Abdomen / Core',
    description: 'Activar glúteos y serrato, retroversión pélvica manteniendo línea recta.',
    photoUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=TvxNkmjdhMM',
    createdAt: '2026-02-10'
  }
];

// Today's date reference: 2026-09-28
const TODAY_STR = '2026-09-28';

const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'rot-1',
    studentId: 'student-1',
    studentName: 'Martina Rossi',
    date: TODAY_STR,
    title: 'Fuerza Pierna & Tren Superior (Día A)',
    notes: 'Priorizar técnica en sentadilla. No rebotar en el fondo.',
    exercises: [
      {
        id: 're-1',
        exerciseId: 'ex-1',
        exerciseName: 'Sentadilla Trasera con Barra (Back Squat)',
        sets: 4,
        targetReps: '8-10',
        suggestedWeightKg: 40,
        notes: 'Descanso 90 seg entre series'
      },
      {
        id: 're-2',
        exerciseId: 'ex-3',
        exerciseName: 'Peso Muerto Rumano (RDL)',
        sets: 3,
        targetReps: '10-12',
        suggestedWeightKg: 35,
        notes: 'Sentir estiramiento de isquios'
      },
      {
        id: 're-3',
        exerciseId: 'ex-4',
        exerciseName: 'Remo con Mancuerna Unilateral',
        sets: 3,
        targetReps: '12 por brazo',
        suggestedWeightKg: 12,
        notes: 'Pausa de 1 seg arriba'
      },
      {
        id: 're-4',
        exerciseId: 'ex-5',
        exerciseName: 'Plancha Abdominal Activa (Core)',
        sets: 3,
        targetReps: '40 segundos',
        notes: 'Tensión máxima en abdomen'
      }
    ]
  },
  {
    id: 'rot-2',
    studentId: 'student-1',
    studentName: 'Martina Rossi',
    date: '2026-09-30',
    title: 'Torso & Hipertrofia (Día B)',
    notes: 'Énfasis en press de banca y estabilidad.',
    exercises: [
      {
        id: 're-5',
        exerciseId: 'ex-2',
        exerciseName: 'Press de Banca Plano (Bench Press)',
        sets: 4,
        targetReps: '8',
        suggestedWeightKg: 30
      },
      {
        id: 're-6',
        exerciseId: 'ex-4',
        exerciseName: 'Remo con Mancuerna Unilateral',
        sets: 4,
        targetReps: '10',
        suggestedWeightKg: 14
      }
    ]
  },
  {
    id: 'rot-3',
    studentId: 'student-2',
    studentName: 'Lucas Benítez',
    date: TODAY_STR,
    title: 'Full Body Funcional Metabólico',
    notes: 'Rondas continuas con descanso controlado.',
    exercises: [
      {
        id: 're-7',
        exerciseId: 'ex-1',
        exerciseName: 'Sentadilla Trasera con Barra (Back Squat)',
        sets: 4,
        targetReps: '12',
        suggestedWeightKg: 50
      },
      {
        id: 're-8',
        exerciseId: 'ex-2',
        exerciseName: 'Press de Banca Plano (Bench Press)',
        sets: 4,
        targetReps: '10',
        suggestedWeightKg: 45
      }
    ]
  }
];

const INITIAL_LOGS: WorkoutDayLog[] = [
  {
    id: 'log-1',
    routineId: 'rot-1',
    studentId: 'student-1',
    date: '2026-09-21',
    records: [
      {
        exerciseId: 'ex-1',
        exerciseName: 'Sentadilla Trasera con Barra (Back Squat)',
        rounds: [
          { round: 1, weightKg: 35, reps: 10, completed: true },
          { round: 2, weightKg: 37.5, reps: 10, completed: true },
          { round: 3, weightKg: 40, reps: 8, completed: true },
          { round: 4, weightKg: 40, reps: 8, completed: true }
        ]
      }
    ],
    studentFeedback: 'Me sentí muy cómoda con los 40kg en la última serie.',
    completed: true
  }
];

export const StorageService = {
  // Init data if not present
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXERCISES)) {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(INITIAL_EXERCISES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ROUTINES)) {
      localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(INITIAL_ROUTINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_LOGS));
    }
  },

  // Auth & Session
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  getSavedCredentials() {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_CREDS);
    return raw ? JSON.parse(raw) : null;
  },

  setSavedCredentials(data: { name: string; email: string; role: string; remember: boolean }) {
    if (data.remember) {
      localStorage.setItem(STORAGE_KEYS.SAVED_CREDS, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SAVED_CREDS);
    }
  },

  // Students
  getStudents(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : INITIAL_STUDENTS;
  },

  saveStudent(student: Student) {
    const list = this.getStudents();
    const index = list.findIndex(s => s.id === student.id);
    if (index >= 0) {
      list[index] = student;
    } else {
      list.unshift(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    return student;
  },

  // Exercises (Multimedia)
  getExercises(): Exercise[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    return raw ? JSON.parse(raw) : INITIAL_EXERCISES;
  },

  saveExercise(exercise: Exercise) {
    const list = this.getExercises();
    const index = list.findIndex(e => e.id === exercise.id);
    if (index >= 0) {
      list[index] = exercise;
    } else {
      list.unshift(exercise);
    }
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(list));
    return exercise;
  },

  deleteExercise(id: string) {
    const list = this.getExercises().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(list));
  },

  // Routines & Calendar
  getRoutines(): Routine[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    return raw ? JSON.parse(raw) : INITIAL_ROUTINES;
  },

  saveRoutine(routine: Routine) {
    const list = this.getRoutines();
    const index = list.findIndex(r => r.id === routine.id);
    if (index >= 0) {
      list[index] = routine;
    } else {
      list.unshift(routine);
    }
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(list));
    return routine;
  },

  deleteRoutine(id: string) {
    const list = this.getRoutines().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(list));
  },

  // Workout Logs (Round by Round tracking)
  getWorkoutLogs(): WorkoutDayLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    return raw ? JSON.parse(raw) : INITIAL_LOGS;
  },

  saveWorkoutLog(log: WorkoutDayLog) {
    const list = this.getWorkoutLogs();
    const index = list.findIndex(l => l.routineId === log.routineId && l.date === log.date && l.studentId === log.studentId);
    if (index >= 0) {
      list[index] = log;
    } else {
      list.unshift(log);
    }
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(list));
    return log;
  },

  /**
   * Upload image to backend with Sharp compression
   * Fallback to DataURL if backend is unreachable
   */
  async uploadImageWithSharp(file: File): Promise<{ url: string; optimizedSizeKb?: string; savedPercentage?: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return {
          url: data.file.url,
          optimizedSizeKb: data.file.optimizedSizeKb,
          savedPercentage: data.file.savedPercentage
        };
      }
    } catch (err) {
      console.warn('Backend con Sharp no disponible en este puerto, usando optimización local DataURL:', err);
    }

    // Graceful fallback to client DataURL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string, optimizedSizeKb: (file.size / 1024).toFixed(1) });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
