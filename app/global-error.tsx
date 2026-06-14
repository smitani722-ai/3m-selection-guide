"use client";

export default function GlobalError() {
  return (
    <html lang="ja">
      <body>
        <main
          style={{
            alignItems: "center",
            display: "flex",
            fontFamily: "system-ui, sans-serif",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "24px",
          }}
        >
          <div style={{ maxWidth: "420px" }}>
            <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>
              Application error
            </h1>
            <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
              Please reload the page and try again.
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
