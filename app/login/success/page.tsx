// ومهمته إنه يكون نقطة استقبال للتوكن بعد تسجيل الدخول باستخدام 
// googleAuth , OAuth أو أي طريقة تسجيل دخول أخرى.

"use client";
import { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../context/AuthContext';


export default function LoginSuccess() {
    const router = useRouter();
    const authContext = useContext(AuthContext);

    useEffect(() => {
        if (!authContext) {
            return; 
        }
        
        const { fetchUser } = authContext;
        const url = new URL(window.location.href);
        const tokenFromUrl = url.searchParams.get('token');

        if (tokenFromUrl) {
            localStorage.setItem('token', tokenFromUrl);
            fetchUser().then(() => {
                router.replace('/'); 
            });
        } else { 
            router.replace('/login');
        }
    }, [router, authContext]);

    return null; // أو ممكن تعرضي رسالة مؤقتة
}