import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react'
import { formatDateRange, type TemplateProps } from './shared'

// Corporate template — white + navy blue accent, clean professional
export function CorporateTemplate({ data }: TemplateProps) {
  const { personal, experiences, education, skills, languages, certifications } = data

  return (
    <div className="bg-white text-[#1e293b] min-h-[297mm] w-[210mm] mx-auto font-sans text-[13px] leading-relaxed">
      {/* Navy header */}
      <header className="bg-[#1e3a5f] text-white px-12 py-10">
        <div className="flex items-center gap-6">
          {personal?.photo && (
            <img
              src={personal.photo}
              alt={personal?.fullName ?? ''}
              className="w-20 h-20 rounded object-cover flex-shrink-0 border-2 border-white/20"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-wide">
              {personal?.fullName || 'Votre Nom'}
            </h1>
            {personal?.title && (
              <p className="mt-1 text-blue-300 text-[12px] tracking-wider uppercase">
                {personal.title}
              </p>
            )}
            {personal?.summary && (
              <p className="mt-2 text-blue-100 text-[12px] leading-relaxed max-w-lg">
                {personal.summary}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-blue-200">
          {personal?.email && <Chip icon={<Mail size={11} />} label={personal.email} />}
          {personal?.phone && <Chip icon={<Phone size={11} />} label={personal.phone} />}
          {personal?.location && <Chip icon={<MapPin size={11} />} label={personal.location} />}
          {personal?.website && <Chip icon={<Globe size={11} />} label={personal.website} />}
          {personal?.linkedin && <Chip icon={<Linkedin size={11} />} label={personal.linkedin} />}
          {personal?.github && <Chip icon={<Github size={11} />} label={personal.github} />}
        </div>
      </header>

      {/* Body */}
      <div className="flex">
        {/* Main column */}
        <div className="flex-1 px-10 py-8 space-y-8">
          {experiences && experiences.length > 0 && (
            <Section title="Expérience">
              {experiences.map((exp) => (
                <div key={exp.id} className="mb-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#1e3a5f]">{exp.position}</p>
                      <p className="text-[#3b82f6] font-medium text-[12px]">{exp.company}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap ml-4 bg-gray-50 px-2 py-0.5 rounded">
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="mt-1.5 text-gray-600 text-[12px]">{exp.description}</p>
                  )}
                </div>
              ))}
            </Section>
          )}

          {education && education.length > 0 && (
            <Section title="Formation">
              {education.map((edu) => (
                <div key={edu.id} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#1e3a5f]">{edu.degree}{edu.field ? ` · ${edu.field}` : ''}</p>
                      <p className="text-[#3b82f6] text-[12px]">{edu.institution}</p>
                    </div>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap ml-4 bg-gray-50 px-2 py-0.5 rounded">
                      {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                    </span>
                  </div>
                </div>
              ))}
            </Section>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-48 bg-gray-50 px-6 py-8 space-y-7 border-l border-gray-100">
          {skills && skills.length > 0 && (
            <SideSection title="Compétences">
              <div className="space-y-1.5">
                {skills.map((s) => (
                  <div key={s.id}>
                    <p className="text-[11px] text-[#1e293b]">{s.name}</p>
                    {s.level && (
                      <div className="mt-0.5 h-1 bg-gray-200 rounded">
                        <div
                          className="h-1 bg-[#1e3a5f] rounded"
                          style={{ width: `${(s.level / 5) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SideSection>
          )}

          {languages && languages.length > 0 && (
            <SideSection title="Langues">
              {languages.map((l) => (
                <p key={l.id} className="text-[11px] text-[#1e293b]">
                  {l.name}
                  {l.level && <span className="block text-[10px] text-gray-400">{l.level}</span>}
                </p>
              ))}
            </SideSection>
          )}

          {certifications && certifications.length > 0 && (
            <SideSection title="Certifications">
              {certifications.map((c) => (
                <div key={c.id} className="mb-2">
                  <p className="text-[11px] font-medium text-[#1e293b]">{c.name}</p>
                  {c.issuer && <p className="text-[10px] text-gray-400">{c.issuer}</p>}
                </div>
              ))}
            </SideSection>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#1e3a5f] mb-3 border-b-2 border-[#1e3a5f] pb-1">
        {title}
      </h2>
      {children}
    </div>
  )
}

function SideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[9px] font-bold tracking-widest uppercase text-[#1e3a5f] mb-2 border-b border-[#1e3a5f]/30 pb-1">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1">
      {icon}
      {label}
    </span>
  )
}
