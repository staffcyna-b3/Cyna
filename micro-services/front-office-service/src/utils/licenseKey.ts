import { randomBytes } from 'crypto';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomSegment(length: number): string {
    const bytes = randomBytes(length);
    let segment = '';
    for (let i = 0; i < length; i++) {
        segment += CHARSET[bytes[i] % CHARSET.length];
    }
    return segment;
}

export function generateLicenseKey(): string {
    return `CYNA-${randomSegment(4)}-${randomSegment(4)}-${randomSegment(4)}`;
}
