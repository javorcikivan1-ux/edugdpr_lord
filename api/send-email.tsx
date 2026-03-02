import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  try {

    await resend.emails.send({
      from: "EduGDPR <noreply@edugdpr.sk>",
      to: email,
      subject: "Vitaj v EduGDPR",
      html: "<b>Registrácia úspešná</b>",
    });

    res.status(200).json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

}