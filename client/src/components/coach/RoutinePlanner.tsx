import React, { useState } from 'react';
import { Student, Exercise, Routine, RoutineExercise } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  User, 
  Dumbbell, 
  Sparkles, 
  Video, 
  Check, 
  ArrowRight 
} from 'lucide-react';
import { ExerciseMediaModal } from '../shared/ExerciseMediaModal';

interface RoutinePlannerProps {
  students: Student[];
  exercises: Exercise[];
  preselectedStudentId?: string;
  preselectedDate?: string;
  onRoutineSaved: () => void;
}

export const RoutinePlanner: React.FC<RoutinePlannerProps> = ({
  students,
  exercises,
  preselectedStudentId,
  preselectedDate,
  onRoutineSaved
}) => {
  const [studentId, setStudentId] = useState<string>(
    preselectedStudentId || students[0]?.id || ''
  );
  const [date, setDate] = useState<string>(preselectedDate || '2026-09-28');
  const [title, setTitle] = useState<string>('Fuerza y Rendimiento Deportivo');
  const [notes, setNotes] = useState<string>('Controlar el tempo de bajada en 2 segundos.');
  const [modalExercise, setModalExercise] = useState<Exercise | null>(null);

  // Routine Exercises state
  const [plannedExercises, setPlannedExercises] = useState<
    Array<{
      exerciseId: string;
      sets: number;
      targetReps: string;
      suggestedWeightKg: number;
      notes: string;
    }>
  >([
    {
      exerciseId: exercises[0]?.id || 'ex-1',
      sets: 4,
      targetReps: '8-10',
      suggestedWeightKg: 40,
      notes: 'Calentamiento previo con barra sola'
    },
    {
      exerciseId: exercises[1]?.id || 'ex-2',
      sets: 3,
      targetReps: '10',
      suggestedWeightKg: 30,
      notes: ''
    }
  ]);

  const handleAddExerciseRow = () => {
    setPlannedExercises([
      ...plannedExercises,
      {
        exerciseId: exercises[0]?.id || 'ex-1',
        sets: 3,
        targetReps: '10-12',
        suggestedWeightKg: 20,
        notes: ''
      }
    ]);
  };

  const handleUpdateRow = (index: number, field: string, value: any) => {
    const updated = [...plannedExercises];
    (updated[index] as any)[field] = value;
    setPlannedExercises(updated);
  };

  const handleRemoveRow = (index: number) => {
    setPlannedExercises(plannedExercises.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || plannedExercises.length === 0) {
      alert('Debes seleccionar un alumno y al menos un ejercicio.');
      return;
    }

    const student = students.find((s) => s.id === studentId);

    const routineExercises: RoutineExercise[] = plannedExercises.map((p, idx) => {
      const ex = exercises.find((e) => e.id === p.exerciseId);
      return {
        id: `re-${Date.now()}-${idx}`,
        exerciseId: p.exerciseId,
        exerciseName: ex ? ex.name : 'Ejercicio',
        sets: Number(p.sets),
        targetReps: String(p.targetReps),
        suggestedWeightKg: Number(p.suggestedWeightKg),
        notes: p.notes
      };
    });

    const newRoutine: Routine = {
      id: `rot-${Date.now()}`,
      studentId,
      studentName: student?.name || 'Alumno',
      date,
      title,
      notes,
      exercises: routineExercises
    };

    StorageService.saveRoutine(newRoutine);
    alert('¡Rutina planificada y cargada al calendario con éxito!');
    onRoutineSaved();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Planificador de Rutinas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Estructura series, repeticiones y cargas sugeridas para tus alumnos
          </p>
        </div>

        <button
          onClick={handleAddExerciseRow}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Ejercicio</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Main Parameters Card */}
        <div className="card-soft p-6 bg-white space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Alumno/a Destinatario *</span>
              </label>
              <select
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.goal})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fecha Programada *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />
                <span>Título de la Sesión *</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Piernas & Tren Superior"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Instrucciones generales del profesor para esta sesión
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Buen calentamiento de hombros, descansos de 90 segundos..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Exercises List Card */}
        <div className="card-soft p-6 bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">
              Ejercicios y Cargas ({plannedExercises.length})
            </h3>
            <span className="text-xs text-slate-400">
              El alumno podrá registrar los pesos reales vuelta por vuelta
            </span>
          </div>

          <div className="space-y-3">
            {plannedExercises.map((row, index) => {
              const selectedEx = exercises.find((e) => e.id === row.exerciseId);

              return (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-3 transition hover:bg-slate-50"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                    {/* Exercise Select */}
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                        Ejercicio #{index + 1}
                      </label>
                      <select
                        value={row.exerciseId}
                        onChange={(e) => handleUpdateRow(index, 'exerciseId', e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold focus:outline-none"
                      >
                        {exercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name} — ({ex.muscleGroup})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Media preview button */}
                    {selectedEx && (
                      <button
                        type="button"
                        onClick={() => setModalExercise(selectedEx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 self-start md:self-end mb-0.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Ver video/técnica</span>
                      </button>
                    )}
                  </div>

                  {/* Sets, Reps, Weight and Notes grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Series / Vueltas
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={row.sets}
                        onChange={(e) => handleUpdateRow(index, 'sets', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs text-center font-bold bg-white rounded-xl border border-slate-200 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Reps Objetivo
                      </label>
                      <input
                        type="text"
                        value={row.targetReps}
                        onChange={(e) => handleUpdateRow(index, 'targetReps', e.target.value)}
                        placeholder="8-10"
                        className="w-full px-3 py-1.5 text-xs text-center bg-white rounded-xl border border-slate-200 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Peso Sugerido (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={row.suggestedWeightKg}
                        onChange={(e) =>
                          handleUpdateRow(index, 'suggestedWeightKg', e.target.value)
                        }
                        placeholder="40"
                        className="w-full px-3 py-1.5 text-xs text-center font-bold text-emerald-700 bg-white rounded-xl border border-slate-200"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-[11px] font-medium text-slate-500 mb-1">
                        Nota técnica específica
                      </label>
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => handleUpdateRow(index, 'notes', e.target.value)}
                        placeholder="Ej. Bajar lento"
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 text-slate-700"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1 flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        disabled={plannedExercises.length === 1}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition cursor-pointer disabled:opacity-20"
                        title="Eliminar este ejercicio de la rutina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleAddExerciseRow}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Agregar otro ejercicio</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm hover:shadow transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar y Publicar Rutina</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Media Modal */}
      <ExerciseMediaModal
        exercise={modalExercise}
        onClose={() => setModalExercise(null)}
      />
    </div>
  );
};
