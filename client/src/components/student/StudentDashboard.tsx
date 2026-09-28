import React, { useState, useEffect } from 'react';
import { User, Routine, Exercise, WorkoutDayLog, ExerciseLogRecord, SetLog } from '../../types';
import { StorageService } from '../../services/storageService';
import { ExerciseMediaModal } from '../shared/ExerciseMediaModal';
import { 
  Dumbbell, 
  Calendar, 
  CheckCircle2, 
  Play, 
  Plus, 
  Save, 
  FileText, 
  Clock, 
  Sparkles, 
  LogOut, 
  History, 
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  onSwitchRole: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  onLogout,
  onSwitchRole
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'history'>('today');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutDayLog[]>([]);
  
  // Selected date (defaults to today: 2026-09-28)
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-28');

  // Media modal
  const [mediaExercise, setMediaExercise] = useState<Exercise | null>(null);

  // Original paper scan preview modal
  const [paperScanModalUrl, setPaperScanModalUrl] = useState<string | null>(null);

  // Active workout tracking state: { [exerciseId]: SetLog[] }
  const [activeSetLogs, setActiveSetLogs] = useState<{ [exerciseId: string]: SetLog[] }>({});
  const [studentFeedback, setStudentFeedback] = useState<string>('');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Load student routines and exercises
  const loadData = () => {
    const allRoutines = StorageService.getRoutines();
    // Filter routines for this student (or default to Martina Rossi / student-1)
    const myRoutines = allRoutines.filter(
      (r) => r.studentId === user.id || r.studentName.toLowerCase().includes(user.name.toLowerCase()) || r.studentId === 'student-1'
    );
    setRoutines(myRoutines);
    setExercises(StorageService.getExercises());
    setWorkoutLogs(StorageService.getWorkoutLogs());
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Today's routine
  const todayRoutine = routines.find((r) => r.date === selectedDate) || routines[0];

  // Initialize tracking fields when today's routine changes
  useEffect(() => {
    if (todayRoutine) {
      const existingLog = workoutLogs.find(
        (l) => l.routineId === todayRoutine.id && l.date === selectedDate
      );

      const initialLogs: { [exerciseId: string]: SetLog[] } = {};

      todayRoutine.exercises.forEach((item) => {
        if (existingLog) {
          const rec = existingLog.records.find((r) => r.exerciseId === item.exerciseId);
          if (rec && rec.rounds.length > 0) {
            initialLogs[item.exerciseId] = rec.rounds;
            return;
          }
        }

        // Initialize fresh rounds based on coach target sets
        const setsCount = item.sets || 3;
        const initialWeight = item.suggestedWeightKg || 0;
        const targetRepsNum = parseInt(item.targetReps, 10) || 10;

        initialLogs[item.exerciseId] = Array.from({ length: setsCount }, (_, i) => ({
          round: i + 1,
          weightKg: initialWeight,
          reps: targetRepsNum,
          completed: false
        }));
      });

      setActiveSetLogs(initialLogs);
      if (existingLog?.studentFeedback) {
        setStudentFeedback(existingLog.studentFeedback);
      }
    }
  }, [todayRoutine, selectedDate, workoutLogs]);

  // Handlers for round-by-round logging
  const handleUpdateSet = (
    exerciseId: string,
    roundIndex: number,
    field: 'weightKg' | 'reps' | 'completed',
    value: any
  ) => {
    setActiveSetLogs((prev) => {
      const list = [...(prev[exerciseId] || [])];
      list[roundIndex] = { ...list[roundIndex], [field]: value };
      return { ...prev, [exerciseId]: list };
    });
    setIsSavedFeedback(false);
  };

  const handleAddRound = (exerciseId: string) => {
    setActiveSetLogs((prev) => {
      const list = [...(prev[exerciseId] || [])];
      const last = list[list.length - 1];
      list.push({
        round: list.length + 1,
        weightKg: last ? last.weightKg : 20,
        reps: last ? last.reps : 10,
        completed: false
      });
      return { ...prev, [exerciseId]: list };
    });
  };

  const handleSaveProgress = () => {
    if (!todayRoutine) return;

    const records: ExerciseLogRecord[] = todayRoutine.exercises.map((item) => ({
      exerciseId: item.exerciseId,
      exerciseName: item.exerciseName,
      rounds: activeSetLogs[item.exerciseId] || []
    }));

    const newLog: WorkoutDayLog = {
      id: `log-${Date.now()}`,
      routineId: todayRoutine.id,
      studentId: user.id,
      date: selectedDate,
      records,
      studentFeedback,
      completed: true
    };

    StorageService.saveWorkoutLog(newLog);
    setIsSavedFeedback(true);
    setWorkoutLogs(StorageService.getWorkoutLogs());
    setTimeout(() => setIsSavedFeedback(false), 3000);
  };

  // Find exercise details for media viewer
  const handleOpenMedia = (exerciseId: string) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    if (ex) setMediaExercise(ex);
  };

  // Calculate overall workout completion rate
  let totalSets = 0;
  let completedSets = 0;
  Object.values(activeSetLogs).forEach((rounds) => {
    rounds.forEach((r) => {
      totalSets++;
      if (r.completed) completedSets++;
    });
  });
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans pb-16">
      {/* Top Floating App Bar */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-tight">
                Hola, {user.name.split(' ')[0]}
              </h2>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/60">
                Lunes 28 de Septiembre 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchRole}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Ver como Profe</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs Pill */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs gap-1">
            <button
              onClick={() => setActiveTab('today')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'today'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Mi Rutina de Hoy</span>
            </button>

            <button
              onClick={() => setActiveTab('week')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'week'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Plan Semanal</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Mis Cargas</span>
            </button>
          </div>
        </div>

        {/* TAB 1: TODAY'S WORKOUT & ROUND BY ROUND TRACKING */}
        {activeTab === 'today' && (
          <div className="space-y-6 animate-fade-in">
            {todayRoutine ? (
              <>
                {/* Routine Hero Card */}
                <div className="card-soft p-6 bg-white relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        Sesión asignada por el profesor
                      </span>
                      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mt-1.5">
                        {todayRoutine.title}
                      </h1>
                      {todayRoutine.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">
                          "{todayRoutine.notes}"
                        </p>
                      )}
                    </div>

                    {/* Button to view coach's original paper sheet */}
                    {todayRoutine.paperScanUrl && (
                      <button
                        onClick={() => setPaperScanModalUrl(todayRoutine.paperScanUrl!)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition self-start cursor-pointer shrink-0"
                      >
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span>Ver Hoja Escaneada del Profe</span>
                      </button>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-600">Progreso del entrenamiento</span>
                      <span className="font-bold text-emerald-600">{progressPercent}% completado</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Exercises with Round-by-Round Weight Tracking */}
                <div className="space-y-5">
                  {todayRoutine.exercises.map((item, index) => {
                    const matchedEx = exercises.find((e) => e.id === item.exerciseId);
                    const rounds = activeSetLogs[item.exerciseId] || [];

                    return (
                      <div
                        key={item.id || index}
                        className="card-soft p-5 bg-white space-y-4"
                      >
                        {/* Exercise Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-start gap-3">
                            <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <div>
                              <h3 className="font-bold text-slate-800 text-base">
                                {item.exerciseName}
                              </h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-medium text-slate-500">
                                  Objetivo: {item.sets} vueltas × {item.targetReps} reps
                                </span>
                                {item.suggestedWeightKg ? (
                                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
                                    Sugerido: {item.suggestedWeightKg} kg
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          {/* Watch Technique Button (Video / Photo) */}
                          <button
                            onClick={() => handleOpenMedia(item.exerciseId)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition cursor-pointer self-start sm:self-auto"
                          >
                            <Play className="w-3.5 h-3.5 fill-emerald-600" />
                            <span>Ver Técnica (Foto / Video)</span>
                          </button>
                        </div>

                        {/* Round by Round Input Table */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-400 uppercase px-2">
                            <div className="col-span-3 sm:col-span-2">Vuelta</div>
                            <div className="col-span-4 sm:col-span-4 text-center">Peso Utilizado</div>
                            <div className="col-span-3 sm:col-span-3 text-center">Reps</div>
                            <div className="col-span-2 sm:col-span-3 text-right">Completado</div>
                          </div>

                          {rounds.map((round, rIdx) => (
                            <div
                              key={round.round}
                              className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl border transition-all ${
                                round.completed
                                  ? 'bg-emerald-50/50 border-emerald-100'
                                  : 'bg-slate-50 border-slate-100'
                              }`}
                            >
                              {/* Round label */}
                              <div className="col-span-3 sm:col-span-2 flex items-center gap-1.5 font-bold text-xs text-slate-700">
                                <span>Vuelta #{round.round}</span>
                              </div>

                              {/* Weight input */}
                              <div className="col-span-4 sm:col-span-4 flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  step="0.5"
                                  value={round.weightKg || ''}
                                  onChange={(e) =>
                                    handleUpdateSet(
                                      item.exerciseId,
                                      rIdx,
                                      'weightKg',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="0"
                                  className="w-16 sm:w-20 text-center font-bold text-slate-800 bg-white py-1 px-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <span className="text-[11px] font-medium text-slate-500">kg</span>
                              </div>

                              {/* Reps input */}
                              <div className="col-span-3 sm:col-span-3 flex items-center justify-center gap-1">
                                <input
                                  type="number"
                                  value={round.reps || ''}
                                  onChange={(e) =>
                                    handleUpdateSet(
                                      item.exerciseId,
                                      rIdx,
                                      'reps',
                                      parseInt(e.target.value, 10) || 0
                                    )
                                  }
                                  placeholder="10"
                                  className="w-14 text-center font-semibold text-slate-800 bg-white py-1 px-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                              </div>

                              {/* Checkbox completed */}
                              <div className="col-span-2 sm:col-span-3 flex justify-end pr-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateSet(
                                      item.exerciseId,
                                      rIdx,
                                      'completed',
                                      !round.completed
                                    )
                                  }
                                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition cursor-pointer ${
                                    round.completed
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : 'bg-white border border-slate-200 text-slate-300 hover:text-slate-500'
                                  }`}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add Round button */}
                        <div className="pt-1 flex justify-start">
                          <button
                            type="button"
                            onClick={() => handleAddRound(item.exerciseId)}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Agregar otra vuelta</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Feedback notes & Save Day button */}
                <div className="card-soft p-6 bg-white space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Notas del alumno para el profesor (¿Cómo te sentiste hoy?)
                    </label>
                    <textarea
                      rows={2}
                      value={studentFeedback}
                      onChange={(e) => setStudentFeedback(e.target.value)}
                      placeholder="Ej. Me sentí bien con las sentadillas, en la última serie subí 2.5kg y pude completar las 8 reps..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {isSavedFeedback ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-pulse">
                        <CheckCircle2 className="w-4 h-4" /> ¡Progreso y pesos guardados con éxito!
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {completedSets} de {totalSets} vueltas completadas
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveProgress}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Entrenamiento de Hoy</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-soft p-12 bg-white text-center text-slate-400">
                <p className="text-sm font-semibold text-slate-700">
                  No tienes entrenamiento programado para esta fecha.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Tu profesor cargará tu próxima rutina en el calendario.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: WEEKLY SCHEDULE */}
        {activeTab === 'week' && (
          <div className="space-y-5 animate-fade-in">
            <div className="card-soft p-6 bg-white space-y-4">
              <h2 className="text-lg font-bold text-slate-800">
                Tu Planificación Semanal
              </h2>
              <p className="text-xs text-slate-500">
                Visualiza los días de estímulo programados por tu profe para esta semana
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {[
                  { day: 'Lunes', date: '2026-09-28', title: 'Fuerza Pierna & Tren Superior (Día A)' },
                  { day: 'Martes', date: '2026-09-29', title: 'Descanso activo / Movilidad' },
                  { day: 'Miércoles', date: '2026-09-30', title: 'Torso & Hipertrofia (Día B)' },
                  { day: 'Jueves', date: '2026-10-01', title: 'Descanso' },
                  { day: 'Viernes', date: '2026-10-02', title: 'Full Body Funcional' },
                  { day: 'Sábado', date: '2026-10-03', title: 'Cardio regenerativo' },
                  { day: 'Domingo', date: '2026-10-04', title: 'Descanso total' }
                ].map((item) => (
                  <div
                    key={item.date}
                    onClick={() => {
                      setSelectedDate(item.date);
                      setActiveTab('today');
                    }}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      item.date === selectedDate
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-100 bg-slate-50/70 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-800 text-sm">{item.day}</span>
                        <span className="text-[11px] text-slate-400">{item.date}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-600 line-clamp-2">
                        {item.title}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-end text-[11px] font-semibold text-emerald-700">
                      <span>Ver rutina</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: WORKOUT LOGS & HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-5 animate-fade-in">
            <div className="card-soft p-6 bg-white space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span>Historial de Cargas Registradas</span>
              </h2>
              <p className="text-xs text-slate-500">
                Sobrecarga progresiva: revisa con qué pesos fuiste trabajando en las sesiones anteriores
              </p>

              <div className="space-y-3 pt-2">
                {workoutLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                        Fecha: {log.date}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Completado
                      </span>
                    </div>

                    <div className="space-y-2">
                      {log.records.map((rec) => (
                        <div
                          key={rec.exerciseId}
                          className="bg-white p-3 rounded-xl border border-slate-100 space-y-1.5"
                        >
                          <h4 className="text-xs font-bold text-slate-800">
                            {rec.exerciseName}
                          </h4>
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {rec.rounds.map((round) => (
                              <span
                                key={round.round}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium text-slate-700"
                              >
                                V{round.round}: {round.weightKg} kg × {round.reps} reps
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {log.studentFeedback && (
                      <p className="text-xs text-slate-500 italic">
                        Feedback: "{log.studentFeedback}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal for viewing coach's original paper sheet */}
      {paperScanModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Planilla Original del Profesor
                </h3>
              </div>
              <button
                onClick={() => setPaperScanModalUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto rounded-2xl bg-slate-100 border border-slate-200">
              <img
                src={paperScanModalUrl}
                alt="Hoja manuscrita del profe"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Video / Photo technique modal */}
      <ExerciseMediaModal
        exercise={mediaExercise}
        onClose={() => setMediaExercise(null)}
      />
    </div>
  );
};
