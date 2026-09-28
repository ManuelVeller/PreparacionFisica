import React from 'react';
import { X, Play, Image as ImageIcon, Dumbbell, ExternalLink } from 'lucide-react';
import { Exercise } from '../../types';
import { getYouTubeEmbedUrl } from '../../utils/youtube';

interface ExerciseMediaModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

export const ExerciseMediaModal: React.FC<ExerciseMediaModalProps> = ({ exercise, onClose }) => {
  if (!exercise) return null;

  const embedUrl = getYouTubeEmbedUrl(exercise.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">{exercise.name}</h3>
              <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                {exercise.muscleGroup}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Video Player */}
          {embedUrl ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <Play className="w-3.5 h-3.5 fill-emerald-600" /> Video explicativo de técnica
                </span>
                {exercise.videoUrl && (
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 hover:text-emerald-600 transition"
                  >
                    Abrir en YouTube <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                <iframe
                  src={embedUrl}
                  title={exercise.name}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          ) : exercise.photoUrl ? (
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Foto ilustrativa
              </span>
              <div className="w-full h-72 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={exercise.photoUrl}
                  alt={exercise.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
              El profesor no ha adjuntado material multimedia para este ejercicio aún.
            </div>
          )}

          {/* Description & Technical Tips */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
              Instrucciones y técnica del profe
            </h4>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {exercise.description || 'Sin notas adicionales.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
