import type { TemplateId, ResumeData } from '@/lib/api/types'
import { MinimalLightTemplate } from './minimal-light'
import { MinimalDarkTemplate } from './minimal-dark'
import { WarmTemplate } from './warm'
import { CorporateTemplate } from './corporate'
import { FrenchClassicTemplate } from './french-classic'

interface CvTemplateProps {
  templateId: TemplateId
  data: ResumeData
}

export function CvTemplate({ templateId, data }: CvTemplateProps) {
  switch (templateId) {
    case 'minimal-dark':
      return <MinimalDarkTemplate data={data} />
    case 'warm':
      return <WarmTemplate data={data} />
    case 'corporate':
      return <CorporateTemplate data={data} />
    case 'french-classic':
      return <FrenchClassicTemplate data={data} />
    case 'minimal-light':
    default:
      return <MinimalLightTemplate data={data} />
  }
}

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  'minimal-light': 'Minimal Clair',
  'minimal-dark': 'Minimal Sombre',
  warm: 'Chaleureux',
  corporate: 'Corporate',
  'french-classic': 'Classique Français',
}
