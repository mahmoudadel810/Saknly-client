"use client";
import React, { useState } from "react";

const initialForm = { name: "", email: "", subject: "", message: "" };

const validateEmail = (email: string) =>
  /^\S+@\S+\.\S+$/.test(email);

const ContactForm = () => {
  const [formData, setFormData] = useState(initialForm);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info" | ""; message: string }>({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; subject?: string; message?: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "الاسم مطلوب";
    else if (formData.name.trim().length < 3) newErrors.name = "الاسم يجب أن يكون على الأقل 3 أحرف";
    else if (formData.name.trim().length > 25) newErrors.name = "الاسم يجب ألا يزيد عن 25 حرفًا";
    if (!formData.email.trim()) newErrors.email = "البريد الإلكتروني مطلوب";
    else if (!validateEmail(formData.email)) newErrors.email = "صيغة البريد غير صحيحة";
    if (!formData.subject.trim()) newErrors.subject = "الموضوع مطلوب";
    else if (formData.subject.trim().length < 5) newErrors.subject = "الموضوع يجب أن يكون على الأقل 5 أحرف";
    else if (formData.subject.trim().length > 50) newErrors.subject = "الموضوع يجب ألا يزيد عن 50 حرفًا";
    if (!formData.message.trim()) newErrors.message = "الرسالة مطلوبة";
    else if (formData.message.trim().length < 10) newErrors.message = "الرسالة يجب أن تكون على الأقل 10 أحرف";
    else if (formData.message.trim().length > 300) newErrors.message = "الرسالة يجب ألا تزيد عن 300 حرف";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus({ type: "error", message: "يرجى تصحيح الحقول المطلوبة" });
      return;
    }
    setLoading(true);
    setStatus({ type: "info", message: "جاري الإرسال..." });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/contact-us`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        setStatus({ type: "success", message: "تم إرسال الرسالة بنجاح!" });
        setFormData(initialForm);
      } else {
        setStatus({ type: "error", message: "فشل في إرسال الرسالة. حاول لاحقًا." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "حدث خطأ أثناء الإرسال. حاول لاحقًا." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="w-full space-y-6" 
      noValidate
    >
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          الاسم
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white ${
            errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-secondary-600'
          }`}
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
          required
        />
        {errors.name && <span id="name-error" className="block mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</span>}
      </div>
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          البريد الإلكتروني
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white ${
            errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-secondary-600'
          }`}
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          required
        />
        {errors.email && <span id="email-error" className="block mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</span>}
      </div>
      <div className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          الموضوع
        </label>
        <input
          type="text"
          name="subject"
          id="subject"
          value={formData.subject}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white ${
            errors.subject ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-secondary-600'
          }`}
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? "subject-error" : undefined}
          required
        />
        {errors.subject && <span id="subject-error" className="block mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</span>}
      </div>
      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          رسالتك
        </label>
        <textarea
          name="message"
          id="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-secondary-700 dark:border-secondary-600 dark:text-white ${
            errors.message ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-secondary-600'
          }`}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          required
        />
        {errors.message && <span id="message-error" className="block mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</span>}
      </div>
      <div className="text-center">
        <button
          type="submit"
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
          aria-busy={loading}
        >
          {loading && <svg className="w-5 h-5 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>}
          إرسال الرسالة
        </button>
      </div>
      <div aria-live="polite" className="min-h-10">
        {status.message && (
          <p
            className={`p-3 rounded-md text-sm font-medium ${
              status.type === "success"
                ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                : status.type === "error"
                ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                : status.type === "info"
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400'
            }`}
          >
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default ContactForm;
