import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react'
import { formatDateRange, type TemplateProps } from './shared'

// Warm template — cream background, terracotta accent
export function WarmTemplate({ data }: TemplateProps) {
  const { personal, experiences, education, skills, languages, certifications } = data

  return (
    <div className="bg-[#fdf8f3] text-[#3d2b1f] min-h-[297mm] w-[210mm] mx-auto font-serif text-[13px] leading-relaxed">
      {/* Top accent bar */}
      <div className="h-2 bg-[#c4704a]" />

      <header className="px-12 pt-10 pb-8">
        <div className="flex items-start gap-6">
          {personal?.photo && (
            <img
              src={personal.photo}
              alt={personal?.fullName ?? ''}
              className="w-24 h-24 rounded-full object-cover flex-shrink-0 border-2 border-[#c4704a]"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#3d2b1f]">
              {personal?.fullName || 'Votre Nom'}
            </h1>
            {personal?.title && (
              <p className="mt-1 text-[#c4704a] text-[12px] font-semibold tracking-wider uppercase">
                {personal.title}
              </p>
            )}
            {personal?.summary && (
              <p className="mt-3 text-[#6b4c3b] text-[12px] leading-relaxed max-w-xl italic">
                {personal.summary}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-[#8b6151]">
          {personal?.email && <Chip icon={<Mail size={11} />} label={personal.email} />}
          {personal?.phone && <Chip icon={<Phone size={11} />} label={personal.phone} />}
          {personal?.location && <Chip icon={<MapPin size={11} />} label={personal.location} />}
          {personal?.website && <Chip icon={<Globe size={11} />} label={personal.website} />}
          {personal?.linkedin && <Chip icon={<Linkedin size={11} />} label={personal.linkedin} />}
          {personal?.github && <Chip icon={<Github size={11} />} label={personal.github} />}
        </div>
      </header>

      <div className="px-12 pb-10 space-y-8">
        {experiences && experiences.length > 0 && (
          <Section title="Expérience professionnelle">
            {experiences.map((exp) => (
              <div key={exp.id} className="mb-5 pl-4 border-l-2 border-[#e8c4b0]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[#3d2b1f]">{exp.position}</p>
                    <p className="text-[#c4704a] font-medium">{exp.company}</p>
                  </div>
                  <p className="text-[#8b6151] text-[11px] whitespace-nowrap ml-4">
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </p>
                </div>
                {exp.description && (
                  <p className="mt-1.5 text-[#6b4c3b] text-[12px]">{exp.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {education && education.length > 0 && (
          <Section title="Formation">
            {education.map((edu) => (
              <div key={edu.id} className="mb-4 pl-4 border-l-2 border-[#e8c4b0]">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[#3d2b1f]">{edu.degree}{edu.field ? ` · ${edu.field}` : ''}</p>
                    <p className="text-[#c4704a] font-medium">{edu.institution}</p>
                  </div>
                  <p className="text-[#8b6151] text-[11px] whitespace-nowrap ml-4">
                    {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                  </p>
                </div>
              </div>
            ))}
          </Section>
        )}

        <div className="grid grid-cols-3 gap-8">
          {skills && skills.length > 0 && (
            <Section title="Compétences">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {skills.map((s) => (
                  <span key={s.id} className="px-2 py-0.5 bg-[#f0ddd1] rounded-full text-[11px] text-[#6b4c3b]">
                    {s.name}
                  </span>
                ))}
              </div>
            </Section>
          )}
          {languages && languages.length > 0 && (
            <Section title="Langues">
              {languages.map((l) => (
                <p key={l.id} className="text-[12px] text-[#6b4c3b]">
                  {l.name}{l.level ? <span className="text-[#8b6151]"> · {l.level}</span> : null}
                </p>
              ))}
            </Section>
          )}
          {certifications && certifications.length > 0 && (
            <Section title="Certifications">
              {certifications.map((c) => (
                <div key={c.id} className="mb-2">
                  <p className="text-[12px] font-medium text-[#3d2b1f]">{c.name}</p>
                  {c.issuer && <p className="text-[11px] text-[#8b6151]">{c.issuer}</p>}
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#c4704a] mb-3 pb-1 border-b border-[#e8c4b0]">
        {title}
      </h2>
      {children}
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
