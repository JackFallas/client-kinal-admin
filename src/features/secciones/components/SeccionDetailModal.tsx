import { useEffect, useState } from 'react'
import { FiX, FiUsers } from 'react-icons/fi'
import { getSeccion } from '../../../shared/api/secciones'

interface Estudiante {
  id: number
  carnet?: string
  primerNombre: string
  primerApellido: string
}

interface SeccionDetalle {
  id: number
  codigo: string
  nombre: string
  turno: 'MATUTINO' | 'VESPERTINO'
  grado: number
  carrera?: string
  nivel: 'BASICOS' | 'DIVERSIFICADOS'
  usuarios: Estudiante[]
}

export const SeccionDetailModal = ({ seccionId, onClose }: { seccionId: number; onClose: () => void }) => {
  const [seccion, setSeccion] = useState<SeccionDetalle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSeccion(seccionId)
      .then((r) => setSeccion(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [seccionId])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0A2647]">{seccion?.nombre ?? 'Cargando...'}</h2>
              {seccion && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {seccion.codigo} · Grado {seccion.grado} · {seccion.turno === 'MATUTINO' ? 'Matutino' : 'Vespertino'}
                  {seccion.carrera && ` · ${seccion.carrera}`}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <FiX size={18} />
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 py-8 text-center">Cargando estudiantes...</p>
          ) : !seccion || seccion.usuarios.length === 0 ? (
            <div className="text-center py-8">
              <FiUsers size={28} className="text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Sin estudiantes en esta sección</p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-[#144272] uppercase tracking-wide mb-2">
                {seccion.usuarios.length} estudiantes
              </p>
              <div className="divide-y divide-blue-50 border border-blue-50 rounded-xl overflow-hidden">
                {seccion.usuarios.map((est) => (
                  <div key={est.id} className="px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-blue-50/30">
                    <span className="text-sm text-[#0A2647] font-medium">{est.primerNombre} {est.primerApellido}</span>
                    <span className="text-xs text-slate-400 font-mono">{est.carnet ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
