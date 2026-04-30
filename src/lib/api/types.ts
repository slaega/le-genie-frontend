export type PostStatus = 'EMPTY' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface User {
  id: string
  email: string
  name: string
  avatarPath: string | null
  coverPath: string | null
  professionalRole: string | null
  createdAt: string
  updatedAt: string
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

export interface PostsQueryParams {
  page?: number
  limit?: number
  status?: PostStatus
}
