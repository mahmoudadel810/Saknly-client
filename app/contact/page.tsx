"use client";

import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";
import ContactForm from "@/shared/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Hero Section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">اتصل بنا</h1>
          <p className="text-xl md:text-2xl opacity-90">نحن هنا لمساعدتك. تواصل معنا اليوم!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-secondary-900 dark:text-white">أرسل لنا رسالة</h2>
            <ContactForm />
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-6 text-secondary-900 dark:text-white text-right">معلومات التواصل</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-end text-right w-full">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full text-primary-600 dark:text-primary-400 ml-4 flex-shrink-0">
                    <FaMapMarkerAlt className="text-xl" />
                  </div>
                  <div className="text-right flex-1">
                    <h3 className="font-semibold text-secondary-900 dark:text-white">العنوان</h3>
                    <p className="text-secondary-600 dark:text-secondary-300">شارع الكليات شبين الكوم</p>
                  </div>
                </div>

                <div className="flex items-center justify-end text-right w-full">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full text-primary-600 dark:text-primary-400 ml-4 flex-shrink-0">
                    <FaPhone className="text-xl" />
                  </div>
                  <div className="text-right flex-1">
                    <h3 className="font-semibold text-secondary-900 dark:text-white">الهاتف</h3>
                    <p className="text-secondary-600 dark:text-secondary-300">+201024500274</p>
                  </div>
                </div>

                <div className="flex items-center justify-end text-right w-full">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full text-primary-600 dark:text-primary-400 ml-4 flex-shrink-0">
                    <FaEnvelope className="text-xl" />
                  </div>
                  <div className="text-right flex-1">
                    <h3 className="font-semibold text-secondary-900 dark:text-white">البريد الإلكتروني</h3>
                    <p className="text-secondary-600 dark:text-secondary-300">saknly@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center justify-end text-right w-full">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full text-primary-600 dark:text-primary-400 ml-4 flex-shrink-0">
                    <FaClock className="text-xl" />
                  </div>
                  <div className="text-right flex-1">
                    <h3 className="font-semibold text-secondary-900 dark:text-white">ساعات العمل</h3>
                    <p className="text-secondary-600 dark:text-secondary-300">24 ساعة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-lg overflow-hidden">
              <div className="h-64 md:h-80 w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3435.693112831758!2d31.016314775573537!3d30.557973474668998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7d7223ff2d63f%3A0x9d531b61c0ebb81b!2sITI%20Menofia%20Branch%2C%20Creativa!5e0!3m2!1sen!2seg!4v1753620224817!5m2!1sen!2seg"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="rounded-b-lg"
                  title="موقعنا على الخريطة"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
