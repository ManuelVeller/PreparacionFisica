import React, { useState } from 'react';
import { Student, Exercise, Routine } from '../../types';
import { StorageService } from '../../services/storageService';
import { processPaperScan, OcrResult } from '../../utils/ocr';
import { 
  Camera, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Save, 
  ArrowRight,
  Zap,
  Image as ImageIcon
} from 'lucide-react';

interface PaperRoutineScannerProps {
  students: Student[];
  exercises: Exercise[];
  onRoutineSaved: () => void;
}

export const PaperRoutineScanner: React.FC<PaperRoutineScannerProps> = ({
  students,
  exercises,
  onRoutineSaved
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState<string>('2026-09-28');
  const [routineTitle, setRoutineTitle] = useState('Rutina Escaneada desde Papel');
  const [paperImageUrl, setPaperImageUrl] = useState<string | null>(null);
  const [sharpOptimizationInfo, setSharpOptimizationInfo] = useState<string | null>(null);

  // OCR state
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrProgressText, setOcrProgressText] = useState('');
  const [extractedRawText, setExtractedRawText] = useState('');

  // Structured exercises extracted from paper
  const [scannedExercises, setScannedExercises] = useState<
    Array<{
      id: string;
      name: string;
      sets: number;
      reps: string;
      weight: number;
      exerciseId?: string;
    }>
  >([]);

  // Demo sample paper routine loader for immediate instant testing
  const handleLoadSamplePaper = async () => {
    // A clean workout sheet handwritten-style sample
    const sampleUrl = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80';
    setPaperImageUrl(sampleUrl);
    setSharpOptimizationInfo('Optimizado con Sharp: 3.4 MB original ➔ 380 KB WebP (-88%)');
    
    // Simulate smart OCR parsing of a real trainer sheet
    setIsProcessingOcr(true);
    setOcrProgressText('Analizando caligrafía de la planilla...');

    setTimeout(() => {
      setIsProcessingOcr(false);
      setExtractedRawText(
        "LUNES 28/09 - FUERZA Y TÉCNICA\n" +
        "1. Sentadilla Trasera con Barra 4x10 40kg\n" +
        "2. Press de Banca Plano 3x8 30kg\n" +
        "3. Peso Muerto Rumano 3x12 35kg\n" +
        "4. Remo Unilateral 4x10 14kg\n" +
        "Nota: Calentar 10' movilidad de cadera."
      );

      setScannedExercises([
        {
          id: 'scan-1',
          name: 'Sentadilla Trasera con Barra (Back Squat)',
          sets: 4,
          reps: '10',
          weight: 40,
          exerciseId: 'ex-1'
        },
        {
          id: 'scan-2',
          name: 'Press de Banca Plano (Bench Press)',
          sets: 3,
          reps: '8',
          weight: 30,
          exerciseId: 'ex-2'
        },
        {
          id: 'scan-3',
          name: 'Peso Muerto Rumano (RDL)',
          sets: 3,
          reps: '12',
          weight: 35,
          exerciseId: 'ex-3'
        },
        {
          id: 'scan-4',
          name: 'Remo con Mancuerna Unilateral',
          sets: 4,
          reps: '10',
          weight: 14,
          exerciseId: 'ex-4'
        }
      ]);
    }, 900);
  };

  // Real upload from file / camera
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingOcr(true);
    setOcrProgressText('Comprimiendo imagen con Sharp en backend...');

    try {
      // 1. Sharp optimization
      const sharpResult = await StorageService.uploadImageWithSharp(file);
      setPaperImageUrl(sharpResult.url);
      setSharpOptimizationInfo(
        sharpResult.savedPercentage
          ? `Sharp redujo un ${sharpResult.savedPercentage} de peso (${sharpResult.optimizedSizeKb} KB WebP)`
          : 'Foto de papel procesada'
      );

      // 2. OCR processing
      setOcrProgressText('Extrayendo texto del papel con Tesseract.js...');
      const ocrResult: OcrResult = await processPaperScan(file, (p, status) => {
        setOcrProgressText(`${status} (${Math.round(p * 100)}%)`);
      });

      setExtractedRawText(ocrResult.text);

      if (ocrResult.suggestedExercises.length > 0) {
        setScannedExercises(
          ocrResult.suggestedExercises.map((item, idx) => ({
            id: `scan-${Date.now()}-${idx}`,
            name: item.name,
            sets: item.sets || 3,
            reps: item.reps || '10',
            weight: item.weight || 20
          }))
        );
      } else {
        // Fallback default
        setScannedExercises([
          {
            id: `scan-${Date.now()}`,
            name: 'Ejercicio detectado de papel',
            sets: 3,
            reps: '10',
            weight: 20
          }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      alert('Hubo un inconveniente al procesar la foto con OCR.');
    } finally {
      setIsProcessingOcr(false);
      setOcrProgressText('');
    }
  };

  const handleUpdateExercise = (
    index: number,
    field: 'name' | 'sets' | 'reps' | 'weight',
    value: any
  ) => {
    const updated = [...scannedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setScannedExercises(updated);
  };

  const handleAddRow = () => {
    setScannedExercises([
      ...scannedExercises,
      {
        id: `scan-${Date.now()}`,
        name: 'Nuevo ejercicio',
        sets: 3,
        reps: '10',
        weight: 15
      }
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setScannedExercises(scannedExercises.filter((_, i) => i !== index));
  };

  const handleSaveRoutine = () => {
    if (!selectedStudentId || scannedExercises.length === 0) {
      alert('Debes seleccionar un alumno y tener al menos un ejercicio.');
      return;
    }

    const student = students.find((s) => s.id === selectedStudentId);

    const newRoutine: Routine = {
      id: `rot-scan-${Date.now()}`,
      studentId: selectedStudentId,
      studentName: student?.name || 'Alumno',
      date: scheduledDate,
      title: routineTitle,
      paperScanUrl: paperImageUrl || undefined,
      notes: extractedRawText ? `Texto de papel:\n${extractedRawText.slice(0, 200)}...` : undefined,
      exercises: scannedExercises.map((item, idx) => {
        // Match with existing exercise if possible
        const matched = exercises.find(
          (ex) => ex.name.toLowerCase().includes(item.name.toLowerCase()) ||
                  item.name.toLowerCase().includes(ex.name.toLowerCase())
        );

        return {
          id: `re-${Date.now()}-${idx}`,
          exerciseId: matched ? matched.id : exercises[0]?.id || 'ex-1',
          exerciseName: item.name,
          sets: Number(item.sets),
          targetReps: String(item.reps),
          suggestedWeightKg: Number(item.weight)
        };
      })
    };

    StorageService.saveRoutine(newRoutine);
    alert('¡Rutina digitalizada y guardada exitosamente en el calendario del alumno!');
    onRoutineSaved();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Escanear Planificaciones en Papel
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-emerald-500" /> Sharp + OCR
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Sigue escribiendo tus rutinas en papel. Toma una foto y digitalízala automáticamente para tus alumnos.
          </p>
        </div>

        {/* Demo button */}
        <button
          onClick={handleLoadSamplePaper}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Probar con Planilla Demo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Upload / Capture and Sheet Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-soft p-5 bg-white space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>1. Foto de la Planilla en Papel</span>
            </h3>

            {/* Upload Zone */}
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer transition text-center">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">
                Tomar foto o subir planilla
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                La comprimiremos con Sharp para que no gaste datos
              </span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Optimization Status Badge */}
            {sharpOptimizationInfo && (
              <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sharpOptimizationInfo}</span>
              </div>
            )}

            {/* Loading OCR */}
            {isProcessingOcr && (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-900 text-xs flex items-center gap-3 animate-pulse">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
                <span>{ocrProgressText}</span>
              </div>
            )}

            {/* Image Preview */}
            {paperImageUrl && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Hoja de papel cargada (visible para el alumno):
                </span>
                <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-slate-100">
                  <img
                    src={paperImageUrl}
                    alt="Planilla del profe"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Structured Exercises Detected & Assign */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card-soft p-5 bg-white space-y-5">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>2. Datos de Asignación y Ejercicios Detectados</span>
            </h3>

            {/* Target Student & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Asignar a Alumno/a
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Fecha en Calendario
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Título de la Sesión
                </label>
                <input
                  type="text"
                  value={routineTitle}
                  onChange={(e) => setRoutineTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Exercises Table / Form */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Ejercicios extraídos ({scannedExercises.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar fila</span>
                </button>
              </div>

              {scannedExercises.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Sube o toma una foto de la planilla o haz clic en "Probar con Planilla Demo" para cargar ejercicios automáticamente.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {scannedExercises.map((row, idx) => (
                    <div
                      key={row.id}
                      className="p-3 bg-slate-50/90 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 text-xs"
                    >
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) => handleUpdateExercise(idx, 'name', e.target.value)}
                          placeholder="Nombre del ejercicio"
                          className="w-full px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 font-medium text-slate-800 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[11px]">Series:</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={row.sets}
                            onChange={(e) => handleUpdateExercise(idx, 'sets', e.target.value)}
                            className="w-12 px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-center font-semibold text-slate-700"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[11px]">Reps:</span>
                          <input
                            type="text"
                            value={row.reps}
                            onChange={(e) => handleUpdateExercise(idx, 'reps', e.target.value)}
                            placeholder="10"
                            className="w-14 px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-center text-slate-700"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[11px]">Kg:</span>
                          <input
                            type="number"
                            value={row.weight}
                            onChange={(e) => handleUpdateExercise(idx, 'weight', e.target.value)}
                            placeholder="kg"
                            className="w-14 px-2 py-1.5 bg-white rounded-lg border border-slate-200 text-center font-semibold text-emerald-700"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Save Routine Button */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={handleSaveRoutine}
                disabled={scannedExercises.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold shadow-sm hover:shadow transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Rutina en el Calendario</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
