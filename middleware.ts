import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    role: string;
}

// صفحات تحتاج تسجيل دخول
const protectedPaths = ['/uploadProperty', '/userProfile', '/wishlist'];

const redirectToLogin = (request: NextRequest, pathname: string) => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
};

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    // صفحات عامة مفيش حماية عليها
    const publicPaths = ['/', '/login', '/register', '/about', '/contact', '/faq', '/privacy-policy'];

    if (publicPaths.includes(pathname)) {
        return NextResponse.next();
    }

    const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (isProtected && !token) {
        return redirectToLogin(request, pathname);
    }

    // لو بيحاول يدخل صفحة أدمن وهو مش معاه توكن
    if (pathname.startsWith('/admin')) {
        if (!token) return redirectToLogin(request, pathname);

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            if (decoded.role !== 'admin') {
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch (err) {
            console.error('Invalid token for admin page');
            return redirectToLogin(request, pathname);
        }
    }

    // Allow access to other pages
    return NextResponse.next();
}


// ه بيقول: شغّل الـ middleware على كل الصفحات ما عدا:
// ملفات الصور
// ملفات النظام الداخلية مثل _next/static
// صفحات API
// أي ملفات داخل مجلد public

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|images|public|api|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};

