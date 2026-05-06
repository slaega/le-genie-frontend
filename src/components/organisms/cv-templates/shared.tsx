import type { ResumeData, ResumeExperience, ResumeEducation, ResumeSkill, ResumeLanguage, ResumeCertification } from '@/lib/api/types'

export interface TemplateProps {
  data: ResumeData
}

export function formatDateRange(start?: string, end?: string, current?: boolean): string {
  if (!start) return ''
  const fmt = (d: string) => {
    const [y, m] = d.split('-')
    if (!m) return y
    const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
    return `${months[parseInt(m, 10) - 1]} ${y}`
  }
  const endLabel = current ? 'Présent' : end ? fmt(end) : 'Présent'
  return `${fmt(start)} – ${endLabel}`
}

export type { ResumeData, ResumeExperience, ResumeEducation, ResumeSkill, ResumeLanguage, ResumeCertification }
