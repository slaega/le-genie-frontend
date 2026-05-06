'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff, Save, Trash2, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { CvTemplate, TEMPLATE_LABELS } from '@/components/organisms/cv-templates'
import { TEMPLATE_IDS, type Resume, type ResumeData, type TemplateId } from '@/lib/api/types'
import { saveResume, deleteResumeAction } from '@/app/actions/resume'

interface Props {
  initial: Resume
  userId: string
  locale: string
}

export function CvEditor({ initial, userId, locale }: Props) {
  const [templateId, setTemplateId] = useState<TemplateId>(initial.templateId)
  const [isPublic, setIsPublic] = useState(initial.isPublic)
  const [data, setData] = useState<ResumeData>(initial.data ?? {})
  const [isPending, startTransition] = useTransition()

  const patchData = (partial: Partial<ResumeData>) =>
    setData((prev) => ({ ...prev, ...partial }))

  const patchPersonal = (partial: Partial<ResumeData['personal']>) =>
    setData((prev) => ({ ...prev, personal: { ...prev.personal, ...partial } }))

  const handleSave = () => {
    startTransition(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await saveResume({ templateId, isPublic, data: data as any })
      if (result?.serverError) {
        toast.error('Erreur lors de la sauvegarde')
      } else {
        toast.success('CV sauvegardé')
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteResumeAction({})
      if (result?.serverError) {
        toast.error('Erreur lors de la suppression')
      } else {
        toast.success('CV supprimé')
        setData({})
      }
    })
  }

  const publicUrl = `/${locale}/cv/${userId}`

  return (
    <div className="flex gap-6 h-full">
      {/* ── Editor panel ── */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto pr-2">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Mon CV</h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setIsPublic((v) => !v); }}
              title={isPublic ? 'Rendre privé' : 'Rendre public'}
            >
              {isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
              {isPublic ? 'Public' : 'Privé'}
            </Button>
            {isPublic && (
              <Button size="sm" variant="ghost" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} />
                </a>
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isPending}>
              <Trash2 size={14} />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              <Save size={14} />
              {isPending ? 'Sauvegarde…' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        {/* Template selector */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            Modèle
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATE_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setTemplateId(id)}
                className={`px-3 py-2 rounded border text-sm text-left transition-colors ${
                  templateId === id
                    ? 'border-primary bg-primary/5 font-semibold text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {TEMPLATE_LABELS[id]}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Form tabs */}
        <Tabs defaultValue="personal">
          <TabsList className="w-full">
            <TabsTrigger value="personal" className="flex-1 text-xs">Infos</TabsTrigger>
            <TabsTrigger value="experience" className="flex-1 text-xs">Expériences</TabsTrigger>
            <TabsTrigger value="education" className="flex-1 text-xs">Formation</TabsTrigger>
            <TabsTrigger value="skills" className="flex-1 text-xs">Compétences</TabsTrigger>
          </TabsList>

          {/* Personal */}
          <TabsContent value="personal" className="space-y-3 mt-3">
            <Field label="Nom complet">
              <Input value={data.personal?.fullName ?? ''} onChange={(e) => patchPersonal({ fullName: e.target.value })} />
            </Field>
            <Field label="Titre / Poste">
              <Input value={data.personal?.title ?? ''} onChange={(e) => patchPersonal({ title: e.target.value })} />
            </Field>
            <Field label="Résumé">
              <Textarea rows={3} value={data.personal?.summary ?? ''} onChange={(e) => patchPersonal({ summary: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input type="email" value={data.personal?.email ?? ''} onChange={(e) => patchPersonal({ email: e.target.value })} />
            </Field>
            <Field label="Téléphone">
              <Input value={data.personal?.phone ?? ''} onChange={(e) => patchPersonal({ phone: e.target.value })} />
            </Field>
            <Field label="Localisation">
              <Input value={data.personal?.location ?? ''} onChange={(e) => patchPersonal({ location: e.target.value })} />
            </Field>
            <Field label="Site web">
              <Input value={data.personal?.website ?? ''} onChange={(e) => patchPersonal({ website: e.target.value })} />
            </Field>
            <Field label="LinkedIn">
              <Input value={data.personal?.linkedin ?? ''} onChange={(e) => patchPersonal({ linkedin: e.target.value })} />
            </Field>
            <Field label="GitHub">
              <Input value={data.personal?.github ?? ''} onChange={(e) => patchPersonal({ github: e.target.value })} />
            </Field>
          </TabsContent>

          {/* Experience */}
          <TabsContent value="experience" className="space-y-4 mt-3">
            <ExperienceEditor
              experiences={data.experiences ?? []}
              onChange={(experiences) => patchData({ experiences })}
            />
          </TabsContent>

          {/* Education */}
          <TabsContent value="education" className="space-y-4 mt-3">
            <EducationEditor
              education={data.education ?? []}
              onChange={(education) => patchData({ education })}
            />
          </TabsContent>

          {/* Skills */}
          <TabsContent value="skills" className="space-y-4 mt-3">
            <SkillsEditor
              skills={data.skills ?? []}
              languages={data.languages ?? []}
              onChange={(partial) => patchData(partial)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Preview panel ── */}
      <div className="flex-1 overflow-auto bg-gray-100 rounded-xl p-6">
        <div className="scale-[0.65] origin-top-left w-[210mm]">
          <CvTemplate templateId={templateId} data={data} />
        </div>
      </div>
    </div>
  )
}

// ─── Sub-editors ──────────────────────────────────────────────────────────────

import { nanoid } from 'nanoid'
import type { ResumeExperience, ResumeEducation, ResumeSkill, ResumeLanguage } from '@/lib/api/types'

function ExperienceEditor({
  experiences,
  onChange,
}: {
  experiences: ResumeExperience[]
  onChange: (v: ResumeExperience[]) => void
}) {
  const add = () =>
    onChange([
      ...experiences,
      { id: nanoid(), company: '', position: '', startDate: '', current: true },
    ])

  const update = (id: string, partial: Partial<ResumeExperience>) =>
    onChange(experiences.map((e) => (e.id === id ? { ...e, ...partial } : e)))

  const remove = (id: string) => onChange(experiences.filter((e) => e.id !== id))

  return (
    <div className="space-y-4">
      {experiences.map((exp) => (
        <div key={exp.id} className="border rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Expérience</span>
            <button onClick={() => remove(exp.id)} className="text-destructive hover:underline text-xs">Supprimer</button>
          </div>
          <Input placeholder="Poste" value={exp.position} onChange={(e) => update(exp.id, { position: e.target.value })} />
          <Input placeholder="Entreprise" value={exp.company} onChange={(e) => update(exp.id, { company: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Début (YYYY-MM)" value={exp.startDate} onChange={(e) => update(exp.id, { startDate: e.target.value })} />
            <Input placeholder="Fin" value={exp.endDate ?? ''} onChange={(e) => update(exp.id, { endDate: e.target.value })} disabled={exp.current} />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={exp.current ?? false} onChange={(e) => update(exp.id, { current: e.target.checked })} />
            En cours
          </label>
          <Textarea placeholder="Description" rows={2} value={exp.description ?? ''} onChange={(e) => update(exp.id, { description: e.target.value })} />
        </div>
      ))}
      <Button size="sm" variant="outline" className="w-full" onClick={add}>+ Ajouter une expérience</Button>
    </div>
  )
}

function EducationEditor({
  education,
  onChange,
}: {
  education: ResumeEducation[]
  onChange: (v: ResumeEducation[]) => void
}) {
  const add = () =>
    onChange([...education, { id: nanoid(), institution: '', degree: '', startDate: '', current: true }])

  const update = (id: string, partial: Partial<ResumeEducation>) =>
    onChange(education.map((e) => (e.id === id ? { ...e, ...partial } : e)))

  const remove = (id: string) => onChange(education.filter((e) => e.id !== id))

  return (
    <div className="space-y-4">
      {education.map((edu) => (
        <div key={edu.id} className="border rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium text-xs uppercase tracking-wider text-muted-foreground">Formation</span>
            <button onClick={() => remove(edu.id)} className="text-destructive hover:underline text-xs">Supprimer</button>
          </div>
          <Input placeholder="Diplôme / Titre" value={edu.degree} onChange={(e) => update(edu.id, { degree: e.target.value })} />
          <Input placeholder="Domaine" value={edu.field ?? ''} onChange={(e) => update(edu.id, { field: e.target.value })} />
          <Input placeholder="Établissement" value={edu.institution} onChange={(e) => update(edu.id, { institution: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Début (YYYY-MM)" value={edu.startDate} onChange={(e) => update(edu.id, { startDate: e.target.value })} />
            <Input placeholder="Fin" value={edu.endDate ?? ''} onChange={(e) => update(edu.id, { endDate: e.target.value })} disabled={edu.current} />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={edu.current ?? false} onChange={(e) => update(edu.id, { current: e.target.checked })} />
            En cours
          </label>
        </div>
      ))}
      <Button size="sm" variant="outline" className="w-full" onClick={add}>+ Ajouter une formation</Button>
    </div>
  )
}

function SkillsEditor({
  skills,
  languages,
  onChange,
}: {
  skills: ResumeSkill[]
  languages: ResumeLanguage[]
  onChange: (v: { skills?: ResumeSkill[]; languages?: ResumeLanguage[] }) => void
}) {
  const addSkill = () => onChange({ skills: [...skills, { id: nanoid(), name: '' }] })
  const updateSkill = (id: string, partial: Partial<ResumeSkill>) =>
    onChange({ skills: skills.map((s) => (s.id === id ? { ...s, ...partial } : s)) })
  const removeSkill = (id: string) => onChange({ skills: skills.filter((s) => s.id !== id) })

  const addLang = () => onChange({ languages: [...languages, { id: nanoid(), name: '' }] })
  const updateLang = (id: string, partial: Partial<ResumeLanguage>) =>
    onChange({ languages: languages.map((l) => (l.id === id ? { ...l, ...partial } : l)) })
  const removeLang = (id: string) => onChange({ languages: languages.filter((l) => l.id !== id) })

  return (
    <div className="space-y-6">
      {/* Skills */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Compétences</Label>
        <div className="space-y-2">
          {skills.map((s) => (
            <div key={s.id} className="flex gap-2 items-center">
              <Input placeholder="Compétence" value={s.name} onChange={(e) => updateSkill(s.id, { name: e.target.value })} className="flex-1" />
              <Input
                type="number"
                min={1}
                max={5}
                placeholder="1-5"
                value={s.level ?? ''}
                onChange={(e) => updateSkill(s.id, { level: parseInt(e.target.value) || undefined })}
                className="w-16"
              />
              <button onClick={() => removeSkill(s.id)} className="text-destructive text-xs hover:underline">✕</button>
            </div>
          ))}
        </div>
        <Button size="sm" variant="outline" className="w-full mt-2" onClick={addSkill}>+ Compétence</Button>
      </div>

      {/* Languages */}
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Langues</Label>
        <div className="space-y-2">
          {languages.map((l) => (
            <div key={l.id} className="flex gap-2 items-center">
              <Input placeholder="Langue" value={l.name} onChange={(e) => updateLang(l.id, { name: e.target.value })} className="flex-1" />
              <Input placeholder="Niveau" value={l.level ?? ''} onChange={(e) => updateLang(l.id, { level: e.target.value })} className="w-24" />
              <button onClick={() => removeLang(l.id)} className="text-destructive text-xs hover:underline">✕</button>
            </div>
          ))}
        </div>
        <Button size="sm" variant="outline" className="w-full mt-2" onClick={addLang}>+ Langue</Button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1">{label}</Label>
      {children}
    </div>
  )
}
