import React, { useState } from 'react';
import { Exercise } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  Plus, 
  Video, 
  Image as ImageIcon, 
  Play, 
  Upload, 
  CheckCircle2, 
  X, 
  Trash2,
  Sparkles,
  Zap
} from 'lucide-react';
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from '../../utils/youtube';
import { ExerciseMediaModal } from '../shared/ExerciseMediaModal';

interface MultimediaLibraryProps {
  exercises: Exercise[];
  onRefresh: () => void;
}

export const MultimediaLibrary: React.FC<MultimediaLibraryProps> = ({
  exercises,
  onRefresh
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string>('todos');
  const [activeModalExercise, setActiveModalExercise] = useState<Exercise | null>(null);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Piernas');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const muscleGroups = [
    'todos',
    'Piernas',
    'Pecho',
    'Espalda',
    'Hombros',
    'Brazos',
    'Abdomen / Core'
  ];

  const filteredExercises = exercises.filter(
    (ex) =>
      selectedMuscle === 'todos' ||
      ex.muscleGroup.toLowerCase().includes(selectedMuscle.toLowerCase())
  );

  // Handle Photo upload with Sharp compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Optimizando imagen con Sharp...');

    try {
      const result = await StorageService.uploadImageWithSharp(file);
      setPhotoUrl(result.url);
      setUploadStatus(
        result.savedPercentage
          ? `¡Sharp comprimió ${result.savedPercentage}! (${result.optimizedSizeKb} KB WebP)`
          : 'Imagen lista'
      );
    } catch (err) {
      setUploadStatus('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      name,
      muscleGroup,
      description,
      photoUrl: photoUrl || undefined,
      videoUrl: videoUrl || undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    StorageService.saveExercise(newExercise);
    setIsCreating(false);
    setName('');
    setDescription('');
    setVideoUrl('');
    setPhotoUrl('');
    setUploadStatus(null);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Deseas eliminar este ejercicio de la biblioteca?')) {
      StorageService.deleteExercise(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Biblioteca Multimedia & Técnica
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-emerald-500" /> Optimizado con Sharp
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Sube fotos livianas y videos de YouTube para que tus alumnos aprendan la técnica correcta
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm hover:shadow transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Ejercicio Multimedia</span>
        </button>
      </div>

      {/* Filter by Muscle Group */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {muscleGroups.map((group) => (
          <button
            key={group}
            onClick={() => setSelectedMuscle(group)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap capitalize ${
              selectedMuscle === group
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Exercises Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredExercises.map((ex) => {
          const ytThumb = getYouTubeThumbnail(ex.videoUrl);
          const hasVideo = !!ex.videoUrl;
          const displayImage = ex.photoUrl || ytThumb;

          return (
            <div
              key={ex.id}
              className="card-soft overflow-hidden bg-white flex flex-col justify-between group"
            >
              <div>
                {/* Image/Video Preview Box */}
                <div 
                  className="relative h-44 w-full bg-slate-100 overflow-hidden cursor-pointer"
                  onClick={() => setActiveModalExercise(ex)}
                >
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={ex.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-xs">Sin imagen ni video</span>
                    </div>
                  )}

                  {/* Play badge if YouTube video is present */}
                  {hasVideo && (
                    <div className="absolute inset-0 bg-slate-900/25 flex items-center justify-center backdrop-blur-[1px] group-hover:bg-slate-900/40 transition">
                      <div className="w-12 h-12 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-slate-900 ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Muscle badge overlay */}
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                    {ex.muscleGroup}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">
                    {ex.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {ex.description || 'Sin notas adicionales.'}
                  </p>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveModalExercise(ex)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver Técnica</span>
                  <Play className="w-3 h-3 fill-emerald-600" />
                </button>

                <button
                  onClick={() => handleDelete(ex.id)}
                  className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                  title="Eliminar ejercicio"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Exercise */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Agregar Ejercicio a la Biblioteca
                </h3>
                <p className="text-xs text-slate-500">
                  Asocia fotos y tutoriales en video para tus alumnos
                </p>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Ejercicio *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Estocadas Búlgaras con Mancuerna"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grupo Muscular Principal
                </label>
                <select
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Piernas">Piernas / Tren Inferior</option>
                  <option value="Pecho">Pecho / Pectorales</option>
                  <option value="Espalda">Espalda / Dorsales</option>
                  <option value="Hombros">Hombros / Deltoides</option>
                  <option value="Brazos">Brazos / Bíceps y Tríceps</option>
                  <option value="Abdomen / Core">Abdomen / Zona Media</option>
                </select>
              </div>

              {/* YouTube Video URL Input with Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Enlace de Video de YouTube (Explicación de Técnica)</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    (watch, youtu.be o shorts)
                  </span>
                </label>
                <div className="relative">
                  <Video className="w-4 h-4 text-rose-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {videoUrl && getYouTubeEmbedUrl(videoUrl) && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-[11px] text-emerald-700 font-semibold mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Video detectado con éxito:
                    </p>
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-xs">
                      <iframe
                        src={getYouTubeEmbedUrl(videoUrl)!}
                        title="Preview"
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Image Upload with Sharp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Subir Foto del Ejercicio</span>
                  <span className="text-[11px] text-emerald-600 font-medium">
                    Procesada con Sharp (WebP ultra liviano)
                  </span>
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer transition">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-600 font-medium">
                    {isUploading ? 'Procesando con Sharp...' : 'Haz clic para subir o arrastrar foto'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG o WEBP</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>

                {uploadStatus && (
                  <p className="text-xs text-emerald-700 mt-1 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    {uploadStatus}
                  </p>
                )}

                {photoUrl && (
                  <div className="mt-2 w-32 h-20 rounded-xl overflow-hidden border border-slate-200">
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Indicaciones Técnicas y Errores Comunes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. Mantener escápulas retraídas, no arquear la zona lumbar, respirar al descender..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Guardar en Biblioteca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Exercise Media view */}
      <ExerciseMediaModal
        exercise={activeModalExercise}
        onClose={() => setActiveModalExercise(null)}
      />
    </div>
  );
};
