// Jednoduchý testovací endpoint
export default async function handler(req, res) {
  console.log('=== TEST INVITE API CALLED ===');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, companyName, companyToken, employeeName } = req.body;
  console.log('Received:', { email, companyName, companyToken, employeeName });

  if (!email || !companyName || !companyToken) {
    return res.status(400).json({ error: "Chýbajúce povinné údaje" });
  }

  // Len simulácia úspešného uloženia
  return res.status(200).json({ 
    success: true, 
    message: "Test pozvánka úspešne odoslaná",
    received: { email, companyName, companyToken, employeeName }
  });
}
