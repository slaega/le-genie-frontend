import { describe, it, expect } from 'vitest';
import { ApiError } from '@/lib/api/types';

describe('ApiError', () => {
    it('extends Error with name ApiError', () => {
        const err = new ApiError(401, 'Unauthorized');
        expect(err).toBeInstanceOf(Error);
        expect(err.name).toBe('ApiError');
    });

    it('exposes status and message', () => {
        const err = new ApiError(403, 'Forbidden');
        expect(err.status).toBe(403);
        expect(err.message).toBe('Forbidden');
    });

    it('stores optional data payload', () => {
        const data = { errors: ['field required'] };
        const err = new ApiError(422, 'Validation failed', data);
        expect(err.data).toEqual(data);
    });

    it('is instanceof ApiError for narrowing', () => {
        const err: unknown = new ApiError(500, 'Server error');
        expect(err instanceof ApiError).toBe(true);
    });
});
