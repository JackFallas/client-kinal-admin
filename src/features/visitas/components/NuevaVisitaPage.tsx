import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createVisita } from '../../../shared/api/visitas'
import toast from 'react-hot-toast'

export const NuevaVisitaPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [emitirAlerta, setEmitirAlerta] = useState(false)
  const [form, setForm] = useState({
    estudianteCarnet: '', motivo: '', descripcion: '',
    temperatura: '', presion: '', peso: '', tratamiento: '', observaciones: '', mensajeAlerta: '',
  })

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await createVisita({
        estudianteCarnet: form.estudianteCarnet,
        motivo: form.motivo,
        descripcion: form.descripcion || undefined,
        temperatura: form.temperatura ? Number(form.temperatura) : undefined,
        presion: form.presion || undefined,
        peso: form.peso ? Number(form.peso) : undefined,
        tratamiento: form.tratamiento || undefined,
        observaciones: form.observaciones || undefined,
        emitirAlerta,
        mensajeAlerta: form.mensajeAlerta || undefined,
      })
      toast.success('Visita registrada')
      navigate('/portal/visitas')
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Error al registrar la visita')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, field, type = 'text', placeholder = '', required = false }: {
    label: string; field: string; type?: string; placeholder?: string; required?: boolean
  }) => (
    <div>
      <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">{label}</label>
      <input
        type={type} value={form[field as keyof typeof form]} onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent shadow-sm bg-white"
      />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#0A2647]">Registrar Visita</h1>
        <p className="text-sm text-slate-400 mt-0.5">Complete los datos clínicos del estudiante</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-blue-50 shadow-sm p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Carnet del estudiante *" field="estudianteCarnet" placeholder="2023001" required />
          <Field label="Motivo *" field="motivo" placeholder="Dolor de cabeza, fiebre..." required />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Descripción</label>
          <textarea
            value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)}
            rows={3} placeholder="Descripción detallada del motivo de visita..."
            className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent resize-none shadow-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Field label="Temperatura °C" field="temperatura" type="number" placeholder="37.0" />
          <Field label="Presión" field="presion" placeholder="120/80" />
          <Field label="Peso kg" field="peso" type="number" placeholder="60" />
        </div>

        <Field label="Tratamiento" field="tratamiento" placeholder="Paracetamol 500mg, reposo..." />

        <div>
          <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Observaciones</label>
          <textarea
            value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)}
            rows={2}
            className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent resize-none shadow-sm"
          />
        </div>

        <div className="border-t border-blue-50 pt-4 space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={emitirAlerta} onChange={(e) => setEmitirAlerta(e.target.checked)} className="w-4 h-4 accent-[#0E6BA8]" />
            <span className="text-sm font-medium text-[#0A2647]">Emitir alerta al coordinador de sección</span>
          </label>
          {emitirAlerta && (
            <div>
              <label className="block text-xs font-semibold text-[#144272] mb-1.5 uppercase tracking-wide">Mensaje de la alerta</label>
              <textarea
                value={form.mensajeAlerta} onChange={(e) => set('mensajeAlerta', e.target.value)}
                rows={2} placeholder="Describe la situación para el coordinador..."
                className="w-full border border-blue-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ACC1] focus:border-transparent resize-none shadow-sm"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)}
            className="flex-1 border border-blue-200 text-slate-600 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-gradient-to-r from-[#0A2647] to-[#0E6BA8] hover:from-[#144272] hover:to-[#00ACC1] text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-60">
            {loading ? 'Guardando...' : 'Registrar visita'}
          </button>
        </div>
      </form>
    </div>
  )
}
