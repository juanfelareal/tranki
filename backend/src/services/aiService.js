import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import db from '../config/database.js';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
const getLearnedRules = () => {
  try {
    return db.prepare(`
      SELECT r.keyword, r.category_id, c.name as category_name, c.type as category_type
      FROM category_rules r
      JOIN categories c ON r.category_id = c.id
      ORDER BY LENGTH(r.keyword) DESC
    `).all();
  } catch (error) {
    console.error('Error fetching learned rules:', error);
    return [];
  }
};

// Suggest category based on description - checks learned rules first, then fallback keywords
const suggestCategory = (description, type = 'expense') => {
  const lowerDesc = description.toLowerCase();

  // First, check learned rules (prioritized)
  const learnedRules = getLearnedRules();
  for (const rule of learnedRules) {
    // Only match if type aligns
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

// Parse image for transactions using Claude Vision
export const parseImageForTransactions = async (imageBase64, mimeType) => {
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

  try {
    const response = await anthropic.messages.create({
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
                media_type: mimeType,
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
    });

    // Extract the text response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent) {
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

    // Add suggested categories to each transaction (checks learned rules first)
    if (parsed.transactions && Array.isArray(parsed.transactions)) {
      parsed.transactions = parsed.transactions.map(tx => {
        const suggestion = suggestCategory(tx.description || tx.merchant || '', tx.type || 'expense');
        return {
          ...tx,
          suggested_category: suggestion.category_name,
          suggested_category_id: suggestion.category_id, // Will be set if learned rule matched
          matched_rule: suggestion.matched_rule,
          category_source: suggestion.source, // 'learned' or 'default'
          // Ensure amount is a number
          amount: typeof tx.amount === 'string'
            ? parseFloat(tx.amount.replace(/[^\d.-]/g, ''))
            : tx.amount,
        };
      });
    }

    return parsed;
  } catch (error) {
    console.error('Error parsing image with Claude:', error);
    throw new Error(`Error al analizar la imagen: ${error.message}`);
  }
};

export default {
  parseImageForTransactions,
  suggestCategory,
};
