const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" }
});

const clean = (form, key) => String(form.get(key) || "").trim();

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  if (clean(form, "website")) return json({ ok: true, message: "Thank you." });

  const formType = clean(form, "form_type") || "Contact";
  const name = clean(form, "name");
  const email = clean(form, "email");
  const message = clean(form, "message");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailOnly = formType === "Newsletter" || formType === "Platform Access";

  if (!emailValid || (!emailOnly && (!name || !message))) {
    return json({ ok: false, message: "Please complete all required fields." }, 422);
  }
  if (!env.RESEND_API_KEY || !env.MAIL_FROM || !env.MAIL_TO) {
    return json({ ok: false, message: "Form delivery is not configured. Please email digimeter@csicy.com directly." }, 503);
  }

  const details = [
    `Form: ${formType}`,
    `Name: ${name || "—"}`,
    `Email: ${email}`,
    `Organisation: ${clean(form, "organisation") || "—"}`,
    `Country: ${clean(form, "country") || "—"}`,
    `Subject: ${clean(form, "subject") || "—"}`,
    "",
    message || "—"
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [env.MAIL_TO],
      reply_to: email,
      subject: `[DIGI-METER] ${formType}`,
      text: details
    })
  });

  if (!response.ok) {
    console.error("Resend delivery failed", response.status, await response.text());
    return json({ ok: false, message: "The message could not be sent. Please email digimeter@csicy.com directly." }, 502);
  }
  return json({ ok: true, message: "Thank you — your message has been sent." });
}
