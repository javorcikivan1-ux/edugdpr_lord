const { Resend } = require("resend");

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {

    const data = await resend.emails.send({
      from: "EduGDPR <noreply@edugdpr.sk>",
      to: "javorcik.ivan@gmail.com",
      subject: "Test email",
      html: "<b>funguje</b>",
    });

    return res.status(200).json(data);

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: error.message,
    });

  }

};