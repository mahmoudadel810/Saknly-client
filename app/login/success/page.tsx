// ومهمته إنه يكون نقطة استقبال للتوكن بعد تسجيل الدخول باستخدام
// googleAuth , OAuth أو أي طريقة تسجيل دخول أخرى.

"use client";
import { useEffect, useContext, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthContext';


export default function LoginSuccess() {
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const handled = useRef(false);

    useEffect(() => {
        if (!authContext || handled.current) {
            return;
        }
        handled.current = true;

        const { setSession } = authContext;
        const url = new URL(window.location.href);
        const tokenFromUrl = url.searchParams.get('token');

        if (tokenFromUrl) {
            // Remove the token from the address bar and browser history once it has been read.
            url.searchParams.delete('token');
            window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
            setSession(tokenFromUrl).then(() => {
                router.replace('/');
            });
        } else {
            router.replace('/login');
        }
    }, [router, authContext]);

    return null; // أو ممكن تعرضي رسالة مؤقتة
}
