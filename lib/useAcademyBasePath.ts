import { usePathname } from 'next/navigation';

/**
 * Returns the base path for student page links.
 * If the student is in an academy URL (/academy/[slug]/...), returns /academy/[slug].
 * Otherwise returns /dashboard/student.
 */
export function useAcademyBasePath() {
    const pathname = usePathname();
    const match = pathname.match(/^\/academy\/([^/]+)/);
    if (match) {
        return `/academy/${match[1]}`;
    }
    return '/dashboard/student';
}
