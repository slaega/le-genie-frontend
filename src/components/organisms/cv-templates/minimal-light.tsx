import { Globe, Mail, Phone, MapPin, Link2, Github, Linkedin } from 'lucide-react'
import { formatDateRange, type TemplateProps } from './shared'

export function MinimalLightTemplate({ data }: TemplateProps) {
  const { personal, experiences, education, skills, languages, certifications } = data

  return (
    <div className="bg-white text-gray-900 min-h-[297mm] w-[210mm] mx-auto font-sans text-[13px] leading-relaxed">
      {/* Header */}
      <header className="px-12 pt-12 pb-8 border-b border-gray-200">
        <div className="flex items-start gap-6">
          {personal?.photo && (
            <img
              src={personal.photo}
              alt={personal?.fullName ?? ''}
              className="w-24 h-24 rounded-full object-cover flex-shrink-0 border-2 border-gray-100"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-light tracking-wide text-gray-800">
              {personal?.fullName || 'Votre Nom'}
            </h1>
            {personal?.title && (
              <p className="mt-1 text-base text-gray-500 font-light tracking-widest uppercase text-[11px]">
                {personal.title}
              </p>
            )}
            {personal?.summary && (
              <p className="mt-3 text-gray-600 text-[12px] leading-relaxed max-w-xl">
                {personal.summary}
              </p>
            )}
          </div>
        </div>

        {/* Contact row */}
        <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-gray-500">
          {personal?.email && <ContactItem icon={<Mail size={12} />} label={personal.email} />}
          {personal?.phone && <ContactItem icon={<Phone size={12} />} label={personal.phone} />}
          {personal?.location && <ContactItem icon={<MapPin size={12} />} label={personal.location} />}
          {personal?.website && <ContactItem icon={<Globe size={12} />} label={personal.website} />}
          {personal?.linkedin && <ContactItem icon={<Linkedin size={12} />} label={personal.linkedin} />}
          {personal?.github && <ContactItem icon={<Github size={12} />} label={personal.github} />}
        </div>
      </header>

      <div className="px-12 py-8 space-y-8">
        {/* Experience */}
        {experiences && experiences.length > 0 && (
          <Section title="Expérience">
            {experiences.map((exp) => (
              <div key={exp.id} className="mb-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{exp.position}</p>
                    <p className="text-gray-500">{exp.company}</p>
                  </div>
                  <p className="text-gray-400 text-[11px] whitespace-nowrap ml-4">
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </p>
                </div>
                {exp.description && (
                  <p className="mt-1.5 text-gray-600 text-[12px]">{exp.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <Section title="Formation">
            {education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{edu.degree}{edu.field ? ` · ${edu.field}` : ''}</p>
                    <p className="text-gray-500">{edu.institution}</p>
                  </div>
                  <p className="text-gray-400 text-[11px] whitespace-nowrap ml-4">
                    {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                  </p>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Bottom grid: skills, languages, certs */}
        <div className="grid grid-cols-3 gap-8">
          {skills && skills.length > 0 && (
            <Section title="Compétences">
              <div className="flex flex-wrap gap-1.5 mt-1">
                {skills.map((s) => (
                  <span key={s.id} className="px-2 py-0.5 bg-gray-100 rounded text-[11px] text-gray-700">
                    {s.name}
                  </span>
                ))}
              </div>
            </Section>
          )}
          {languages && languages.length > 0 && (
            <Section title="Langues">
              {languages.map((l) => (
                <p key={l.id} className="text-[12px] text-gray-700">
                  {l.name}{l.level ? <span className="text-gray-400"> · {l.level}</span> : null}
                </p>
              ))}
            </Section>
          )}
          {certifications && certifications.length > 0 && (
            <Section title="Certifications">
              {certifications.map((c) => (
                <div key={c.id} className="mb-2">
                  <p className="text-[12px] font-medium text-gray-800">{c.name}</p>
                  {c.issuer && <p className="text-[11px] text-gray-500">{c.issuer}</p>}
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
      <h2 className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3 border-b border-gray-100 pb-1">
        {title}
      </h2>
      {children}
    </div>
  )
}

function ContactItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1">
      {icon}
      {label}
    </span>
  )
}
