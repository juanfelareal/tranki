import { withAuth } from '../_lib/auth.js';

// Category mapping for suggestions (fallback when no learned rules match)
const CATEGORY_KEYWORDS = {
  'Alimentación': ['rappi', 'ifood', 'restaurante', 'comida', 'almuerzo', 'cena', 'desayuno', 'domicilio', 'mcdonalds', 'burger', 'pizza', 'crepes', 'wok', 'sushi', 'panaderia', 'supermercado', 'exito', 'jumbo', 'carulla', 'd1', 'ara', 'olimpica'],
  'Transporte': ['uber', 'didi', 'cabify', 'taxi', 'beat', 'indriver', 'gasolina', 'peaje', 'parqueadero', 'estacion', 'metro', 'bus', 'transmilenio', 'mio'],
  'Suscripciones': ['netflix', 'spotify', 'amazon', 'disney', 'hbo', 'youtube', 'prime', 'apple', 'google', 'icloud', 'dropbox', 'notion', 'chatgpt', 'openai'],
  'Servicios': ['epm', 'etb', 'claro', 'movistar', 'tigo', 'une', 'acueducto', 'energia', 'gas', 'internet', 'celular', 'telefono'],
  'Compras': ['falabella', 'alkosto', 'homecenter', 'mercadolibre', 'amazon', 'shein', 'zara', 'arturo', 'tennis', 'adidas', 'nike'],
  'Entretenimiento': ['cine', 'cinemark', 'cineco', 'teatro', 'concierto', 'bar', 'discoteca', 'juego', 'steam', 'playstation', 'xbox'],
  'Salud': ['farmacia', 'drogueria', 'medico', 'hospital', 'clinica', 'eps', 'colsanitas', 'sura', 'coomeva', 'consultorio', 'odontologia', 'laboratorio'],
  'Educación': ['universidad', 'colegio', 'curso', 'udemy', 'coursera', 'platzi', 'libro', 'papeleria'],
  'Café': ['starbucks', 'juan valdez', 'oma', 'tostao', 'cafe'],
  'Salario': ['nomina', 'salario', 'sueldo', 'quincena', 'pago'],
  'Freelance': ['freelance', 'proyecto', 'honorarios', 'consultoria'],
  'Inversiones': ['inversion', 'dividendo', 'rendimiento', 'cdt', 'fondo'],
};

// Get learned category rules from database
const getLearnedRules = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('category_rules')
      .select(`keyword, category_id, categories(name, type)`)
      .order('keyword');

    if (error) throw error;

    return (data || []).map(r => ({
      keyword: r.keyword,
      category_id: r.category_id,
      category_name: r.categories?.name,
      category_type: r.categories?.type
    })).sort((a, b) => b.keyword.length - a.keyword.length);
  } catch (error) {
    console.error('Error fetching learned rules:', error);
    return [];
  }
};

// Suggest category based on description
const suggestCategory = async (supabase, description, type = 'expense') => {
  const lowerDesc = description.toLowerCase();

  // First, check learned rules (prioritized)
  const learnedRules = await getLearnedRules(supabase);
  for (const rule of learnedRules) {
    if (rule.category_type !== type) continue;
    if (lowerDesc.includes(rule.keyword)) {
      return {
        category_name: rule.category_name,
        category_id: rule.category_id,
        matched_rule: rule.keyword,
        source: 'learned'
      };
    }
  }

  // Fallback to hardcoded keywords
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerDesc.includes(keyword))) {
      return {
        category_name: category,
        category_id: null,
        matched_rule: null,
        source: 'default'
      };
    }
  }

  return {
    category_name: type === 'income' ? 'Otros Ingresos' : 'Otros Gastos',
    category_id: null,
    matched_rule: null,
    source: 'default'
  };
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const supabase = req.supabase;

    // For Vercel, we expect the image as base64 in the request body
    const { image, mimeType } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ninguna imagen'
      });
    }

    // Remove data URL prefix if present
    const imageBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    const mime = mimeType || 'image/jpeg';

    const prompt = `Analiza esta imagen de un extracto bancario, movimientos de cuenta, o SMS de notificación bancaria colombiana.

Extrae TODAS las transacciones individuales visibles y devuelve ÚNICAMENTE un JSON válido con este formato exacto (sin texto adicional, solo el JSON):
{
  "transactions": [
    {
      "type": "expense",
      "amount": 45000,
      "description": "Compra en Restaurante XYZ",
      "date": "2024-01-15",
      "merchant": "Restaurante XYZ",
      "confidence": 0.95
    }
  ],
  "source_type": "bank_statement",
  "bank_detected": "Bancolombia"
}

REGLAS IMPORTANTES:
1. Moneda es COP (pesos colombianos) - convierte el monto a número sin puntos ni comas
2. "Compra", "Retiro", "Pago", "Débito", "Transferencia enviada" = type "expense"
3. "Abono", "Consignación", "Transferencia recibida", "Depósito", "Nómina" = type "income"
4. IGNORA los saldos (inicial, final, disponible), solo extrae transacciones individuales
5. Si la fecha no es visible, usa null
6. source_type puede ser: "bank_statement", "sms", "receipt", "unknown"
7. Si NO puedes detectar ninguna transacción válida, devuelve: {"transactions": [], "source_type": "unknown", "bank_detected": null}
8. El campo amount debe ser un NÚMERO, no string (ej: 45000 no "45000" ni "$45.000")
9. Cada transacción debe tener un confidence entre 0.0 y 1.0

RESPONDE SOLO CON EL JSON, sin explicaciones ni texto adicional.`;

    // Use native fetch instead of SDK (SDK has connection issues)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mime,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      throw new Error(data.error?.message || 'Error de la API de Anthropic');
    }

    // Extract the text response
    const textContent = data.content?.find(block => block.type === 'text');
    if (!textContent) {
      console.error('No text content in response:', data.content);
      throw new Error('No text response from Claude');
    }

    // Parse JSON from response
    let jsonStr = textContent.text.trim();

    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);

    // Add suggested categories to each transaction
    if (parsed.transactions && Array.isArray(parsed.transactions)) {
      parsed.transactions = await Promise.all(
        parsed.transactions.map(async (tx) => {
          const suggestion = await suggestCategory(supabase, tx.description || tx.merchant || '', tx.type || 'expense');
          return {
            ...tx,
            suggested_category: suggestion.category_name,
            suggested_category_id: suggestion.category_id,
            matched_rule: suggestion.matched_rule,
            category_source: suggestion.source,
            amount: typeof tx.amount === 'string'
              ? parseFloat(tx.amount.replace(/[^\d.-]/g, ''))
              : tx.amount,
          };
        })
      );
    }

    return res.json({
      success: true,
      data: parsed
    });

  } catch (error) {
    console.error('Error processing image:', error);

    // Provide more specific error messages
    let errorMessage = 'Error al procesar la imagen';
    if (error.message?.includes('API key')) {
      errorMessage = 'Error de configuración del servidor';
    } else if (error.message?.includes('JSON')) {
      errorMessage = 'No se pudo interpretar la respuesta de la IA';
    } else if (error.status === 401) {
      errorMessage = 'Error de autenticación con el servicio de IA';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default withAuth(handler);
