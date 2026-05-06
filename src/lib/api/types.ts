export type PostStatus = 'EMPTY' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string
  avatarPath: string | null
  coverPath: string | null
  professionalRole: string | null
  role: UserRole
  suspended: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  avatarPath: string | null
  role: UserRole
  suspended: boolean
  createdAt: string
  _count: { contributors: number; comments: number }
}

export interface AdminPost {
  id: string
  title: string
  status: PostStatus
  readingTime: number | null
  createdAt: string
  updatedAt: string
  contributors: Array<{ user: { id: string; name: string; email: string } }>
  _count: { comments: number; likes: number }
}

export interface AdminStats {
  totalUsers: number
  totalPosts: number
  totalComments: number
  totalSubscribers: number
  totalFollows: number
  postsByStatus: { PUBLISHED: number; DRAFT: number; EMPTY: number; ARCHIVED: number }
}

export interface AdminSubscriber {
  id: string
  email: string
  createdAt: string
}

export interface Contributor {
  id: string
  postId: string
  userId: string
  owner: boolean
  user: User
  createdAt: string
  updatedAt: string
}

export interface PostTag {
  id: string
  postId: string
  name: string
}

export interface Post {
  id: string
  title: string
  content: Record<string, unknown> | null
  imagePath: string | null
  status: PostStatus
  scheduledAt: string | null
  readingTime: number
  commentsCount: number
  contributors: Contributor[]
  postTags: PostTag[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  refactorAt: string | null
  postId: string
  userId: string
  user: User
  createdAt: string
  updatedAt: string
}

export interface Invitation {
  id: string
  email: string
  content: string | null
  postId: string
  token: string
  expiredAt: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface UpdatePostPayload {
  title?: string
  content?: Record<string, unknown>
  status?: PostStatus
  scheduledAt?: string | null
}

export interface SendInvitationPayload {
  email: string
  content?: string
}

export interface CreateCommentPayload {
  content: string
}

export interface UpdateCommentPayload {
  content: string
}

export type NotificationType = 'NEW_POST' | 'NEW_FOLLOWER' | 'NEW_COMMENT'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string | null
  postId: string | null
  read: boolean
  createdAt: string
}

export interface NotificationList {
  items: Notification[]
  unreadCount: number
}

export interface PostsQueryParams {
  page?: number
  limit?: number
  status?: PostStatus
  tags?: string[]
  /** Filtre sur les posts de l'utilisateur connecté (backend: ?me=true) */
  me?: boolean
}

// ─── CV Builder ──────────────────────────────────────────────────────────────

export const TEMPLATE_IDS = [
  'minimal-light',
  'minimal-dark',
  'warm',
  'corporate',
  'french-classic',
] as const

export type TemplateId = (typeof TEMPLATE_IDS)[number]

export interface ResumePersonal {
  fullName?: string
  title?: string
  email?: string
  phone?: string
  location?: string
  website?: string
  linkedin?: string
  github?: string
  summary?: string
  photo?: string
}

export interface ResumeExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  current?: boolean
  description?: string
}

export interface ResumeEducation {
  id: string
  institution: string
  degree: string
  field?: string
  startDate: string
  endDate?: string
  current?: boolean
}

export interface ResumeSkill {
  id: string
  name: string
  level?: number // 1–5
}

export interface ResumeLanguage {
  id: string
  name: string
  level?: string // e.g. "Natif", "Courant", "Intermédiaire"
}

export interface ResumeCertification {
  id: string
  name: string
  issuer?: string
  date?: string
  url?: string
}

export interface ResumeData {
  personal?: ResumePersonal
  experiences?: ResumeExperience[]
  education?: ResumeEducation[]
  skills?: ResumeSkill[]
  languages?: ResumeLanguage[]
  certifications?: ResumeCertification[]
}

export interface Resume {
  id: string
  userId: string
  templateId: TemplateId
  isPublic: boolean
  data: ResumeData
  user?: Pick<User, 'id' | 'name' | 'avatarPath'>
  createdAt: string
  updatedAt: string
}

export interface UpsertResumePayload {
  templateId?: TemplateId
  isPublic?: boolean
  data?: ResumeData
}
