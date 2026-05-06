import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react'
import { formatDateRange, type TemplateProps } from './shared'

// French Classic — two-column, dark slate sidebar (left), clean content (right)
export function FrenchClassicTemplate({ data }: TemplateProps) {
  const { personal, experiences, education, skills, languages, certifications } = data

  return (
    <div className="flex min-h-[297mm] w-[210mm] mx-auto font-sans text-[13px] leading-relaxed bg-white">
      {/* Left sidebar — dark slate */}
      <aside className="w-[72mm] bg-[#2d3748] text-white flex flex-col">
        {/* Photo + name */}
        <div className="px-7 pt-10 pb-8 border-b border-white/10">
          {personal?.photo && (
            <img
              src={personal.photo}
              alt={personal?.fullName ?? ''}
              className="w-20 h-20 rounded-full object-cover border-3 border-white/20 mx-auto mb-4"
            />
          )}
          <h1 className="text-xl font-bold text-center leading-tight">
            {personal?.fullName || 'Votre Nom'}
          </h1>
          {personal?.title && (
            <p className="mt-2 text-[#a0c4e8] text-[10px] font-medium tracking-widest uppercase text-center">
              {personal.title}
            </p>
          )}
        </div>

        {/* Contact */}
        <div className="px-7 py-6 space-y-2 border-b border-white/10">
          <SideTitle>Contact</SideTitle>
          {personal?.email && <SideContact icon={<Mail size={10} />} label={personal.email} />}
          {personal?.phone && <SideContact icon={<Phone size={10} />} label={personal.phone} />}
          {personal?.location && <SideContact icon={<MapPin size={10} />} label={personal.location} />}
          {personal?.website && <SideContact icon={<Globe size={10} />} label={personal.website} />}
          {personal?.linkedin && <SideContact icon={<Linkedin size={10} />} label={personal.linkedin} />}
          {personal?.github && <SideContact icon={<Github size={10} />} label={personal.github} />}
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="px-7 py-6 space-y-1.5 border-b border-white/10">
            <SideTitle>Compétences</SideTitle>
            {skills.map((s) => (
              <div key={s.id}>
                <p className="text-[11px] text-gray-200">{s.name}</p>
                {s.level && (
                  <div className="mt-0.5 h-1 bg-white/10 rounded">
                    <div
                      className="h-1 bg-[#a0c4e8] rounded"
                      style={{ width: `${(s.level / 5) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div className="px-7 py-6 space-y-1.5 border-b border-white/10">
            <SideTitle>Langues</SideTitle>
            {languages.map((l) => (
              <div key={l.id}>
                <p className="text-[11px] text-gray-200">{l.name}</p>
                {l.level && <p className="text-[10px] text-gray-400">{l.level}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="px-7 py-6 space-y-2">
            <SideTitle>Certifications</SideTitle>
            {certifications.map((c) => (
              <div key={c.id}>
                <p className="text-[11px] font-medium text-gray-200">{c.name}</p>
                {c.issuer && <p className="text-[10px] text-gray-400">{c.issuer}</p>}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Right main content */}
      <main className="flex-1 px-9 py-10 space-y-8">
        {/* Summary */}
        {personal?.summary && (
          <div>
            <MainTitle>Profil</MainTitle>
            <p className="text-gray-600 text-[12px] leading-relaxed">{personal.summary}</p>
          </div>
        )}

        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <div>
            <MainTitle>Expérience</MainTitle>
            <div className="space-y-5">
              {experiences.map((exp) => (
                <div key={exp.id} className="relative pl-4 border-l-2 border-[#e2e8f0]">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#2d3748]" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#2d3748]">{exp.position}</p>
                      <p className="text-gray-500 text-[12px]">{exp.company}</p>
                    </div>
                    <p className="text-gray-400 text-[11px] whitespace-nowrap ml-3">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </p>
                  </div>
                  {exp.description && (
                    <p className="mt-1.5 text-gray-600 text-[12px]">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <div>
            <MainTitle>Formation</MainTitle>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="relative pl-4 border-l-2 border-[#e2e8f0]">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#2d3748]" />
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#2d3748]">{edu.degree}{edu.field ? ` · ${edu.field}` : ''}</p>
                      <p className="text-gray-500 text-[12px]">{edu.institution}</p>
                    </div>
                    <p className="text-gray-400 text-[11px] whitespace-nowrap ml-3">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function MainTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#2d3748] mb-3 border-b-2 border-[#2d3748] pb-1">
      {children}
    </h2>
  )
}

function SideTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[9px] font-bold tracking-widest uppercase text-[#a0c4e8] mb-2">
      {children}
    </h3>
  )
}

function SideContact({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <p className="flex items-start gap-1.5 text-[11px] text-gray-300 break-all">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      {label}
    </p>
  )
}
