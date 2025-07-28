import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: "bold",
          color: "#0284c7",
          marginBottom: "1rem",
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: "2rem", color: "#333", marginBottom: "0.5rem" }}>
        الصفحة غير موجودة
      </h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        عذراً، الصفحة التي تبحث عنها غير متوفرة.
      </p>
      <Link href="/">
        <span
          style={{
            background: "#0284c7",
            color: "#fff",
            padding: "0.75rem 2rem",
            borderRadius: "8px",
            fontWeight: "bold",
            textDecoration: "none",
            fontSize: "1.1rem",
            cursor: "pointer",
          }}
        >
          العودة إلى الصفحة الرئيسية
        </span>
      </Link>
    </div>
  );
}
