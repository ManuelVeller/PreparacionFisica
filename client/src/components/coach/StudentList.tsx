import React, { useState } from 'react';
import { Student } from '../../types';
import { StorageService } from '../../services/storageService';
import { UserPlus, Search, AlertCircle, Target, Calendar, ArrowRight, X } from 'lucide-react';

interface StudentListProps {
  students: Student[];
  onSelectStudentForPlan: (student: Student) => void;
  onRefresh: () => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onSelectStudentForPlan,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newInjuries, setNewInjuries] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '+54 9 11 0000-0000',
      goal: newGoal || 'Acondicionamiento físico',
      injuries: newInjuries || 'Sin lesiones reportadas',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    StorageService.saveStudent(newStudent);
    setIsModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewGoal('');
    setNewInjuries('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Alumnos y Alumnas
          </h1>
          <p className="text-sm text-slate-500">
            Fichas de seguimiento, objetivos y planificación directa
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre u objetivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white rounded-full border border-slate-200 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition w-60 sm:w-72"
            />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm hover:shadow transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Alumno</span>
          </button>
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="card-soft p-5 bg-white flex flex-col justify-between"
          >
            <div>
              {/* Header card with avatar */}
              <div className="flex items-start gap-3.5 mb-4">
                <img
                  src={
                    student.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      student.name
                    )}&background=10b981&color=fff&rounded=true`
                  }
                  alt={student.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 text-base truncate">
                    {student.name}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">{student.email}</p>
                  <span className="inline-block mt-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/60">
                    Activo desde {student.joinedDate}
                  </span>
                </div>
              </div>

              {/* Goals & Health details */}
              <div className="space-y-2.5 pt-2 border-t border-slate-50 text-xs">
                <div className="flex items-start gap-2 text-slate-600">
                  <Target className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="line-clamp-2">
                    <span className="font-semibold text-slate-700">Objetivo:</span>{' '}
                    {student.goal}
                  </p>
                </div>

                {student.injuries && (
                  <div className="flex items-start gap-2 text-amber-700 bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-tight">
                      <span className="font-semibold">Observación médica:</span>{' '}
                      {student.injuries}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {student.phone || 'Sin tel.'}
              </span>
              <button
                onClick={() => onSelectStudentForPlan(student)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Armar Rutina</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Registrar Nuevo Alumno</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ej. Martín Giménez"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="martin@correo.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+54 9 11 ..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Objetivo Principal
                </label>
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Ej. Hipertrofia, Salud postural, Fuerza..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lesiones o consideraciones físicas
                </label>
                <textarea
                  rows={2}
                  value={newInjuries}
                  onChange={(e) => setNewInjuries(e.target.value)}
                  placeholder="Ej. Dolor lumbar al flexionar, antecedentes de esguince..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
                >
                  Guardar Alumno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
