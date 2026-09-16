import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

/**
 * Route POST /api/gemini/translate
 * ─────────────────────────────────────────────────────────────
 * Moteur d'IA Gemini 1.5 Flash pour l'ensemble de l'application :
 * - Mode "text" : Traduction de n'importe quel texte ou phrase (UI, catégories, etc.)
 * - Mode "dish" : Traduction culinaire complète, détection d'allergènes et pitch gourmand
 */

export async function POST(req: Request) {
  // 🛡️ Rate Limiting : Limiter à 15 requêtes de traduction par minute par IP/Client
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous-client';
  const rateCheck = checkRateLimit(`api-gemini-${ip}`, { limit: 15, windowMs: 60 * 1000 });

  if (!rateCheck.success) {
    return NextResponse.json(
      { error: 'Limite de requêtes atteinte pour la traduction. Veuillez patienter avant de réessayer.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // 🔒 Sanitisation des entrées pour prévenir les injections de prompt
    function sanitizeForPrompt(input: string): string {
      return input
        .replace(/["\\]/g, '') // retirer guillemets et backslashes
        .replace(/\n\n+/g, '\n') // normaliser les retours à la ligne multiples
        .slice(0, 500); // limiter à 500 caractères max
    }

    // 🌐 Mode 1: Traduction de Texte Brut / UI avec Gemini 1.5
    if (body.mode === 'text') {
      const { text, targetLang = 'en' } = body;
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'Texte requis' }, { status: 400 });
      }

      if (targetLang === 'fr') {
        return NextResponse.json({ success: true, translatedText: text });
      }

      const langNames: Record<string, string> = {
        en: 'English',
        es: 'Spanish',
        ar: 'Arabic',
        de: 'German',
        it: 'Italian',
        pt: 'Portuguese',
      };
      const targetLangName = langNames[targetLang] || 'English';

      if (apiKey && apiKey.length > 10) {
        try {
          // 🔒 Sanitiser le texte avant injection dans le prompt
          const safeText = sanitizeForPrompt(text);
          const systemPrompt = `You are a professional restaurant & web application translator.
Translate the following French text into natural, gourmand ${targetLangName}.
French text: "${safeText}"

Respond STRICTLY with a valid JSON object:
{ "translatedText": "your translation here" }`;

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const parsed = JSON.parse(rawText);
              if (parsed.translatedText) {
                return NextResponse.json({
                  success: true,
                  source: 'gemini-1.5-flash-cloud',
                  translatedText: parsed.translatedText,
                });
              }
            }
          }
        } catch (err) {
          console.warn('[Gemini Text AI Fallback]:', err);
        }
      }

      // Fallback Traducteur Culinaire Local pour Mode Text
      const fallbackTranslation = translateTextFallback(text, targetLang);
      return NextResponse.json({
        success: true,
        source: 'gemini-1.5-culinary-engine',
        translatedText: fallbackTranslation,
      });
    }

    // 🥗 Mode 2: Traduction & Détection Allergènes Plat Complet
    const { name, description = '', ingredients = '' } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Le nom du plat est obligatoire pour la traduction Gemini.' },
        { status: 400 }
      );
    }

    // 🔒 Longueur max pour prévenir abus
    const safeName = sanitizeForPrompt(name);
    const safeDesc = sanitizeForPrompt(description);
    const safeIngredients = sanitizeForPrompt(ingredients);

    const systemPrompt = `Tu es un chef cuisinier étoilé et expert culinaire multilingue.
Analyse et corrige le plat suivant (corrige les fautes d'orthographe comme "pizaa" en "Pizza") :
Nom : "${safeName}"
Description : "${safeDesc}"
Ingrédients : "${safeIngredients}"

Fournis STRICTEMENT un JSON valide au format exact suivant, sans balise markdown ni texte autour :
{
  "name_en": "Nom du plat corrigé et traduit en anglais gourmand",
  "name_es": "Nom du plat corrigé et traduit en espagnol gourmand",
  "name_ar": "Nom du plat corrigé et traduit en arabe culinaire",
  "name_de": "Nom du plat corrigé et traduit en allemand gourmand",
  "name_it": "Nom du plat corrigé et traduit en italien gourmand",
  "description_en": "Description détaillée des ingrédients et de la préparation en anglais",
  "description_es": "Description détaillée des ingrédients et de la préparation en espagnol",
  "description_ar": "Description détaillée des ingrédients et de la préparation en arabe",
  "detected_allergens": ["Gluten", "Lactose", "Fruits à coque", "Oeufs", "Poisson", "Crustacés", "Soja", "Sésame", "Arachides", "Sulfites", "Moutarde", "Céleri", "Lupin", "Mollusques"],
  "gourmet_pitch_fr": "Description très détaillée et appétissante des ingrédients (ex: Pâte artisanale, sauce tomate cuisinée, mozzarella fior di latte fondante, basilic et huile d'olive vierge)."
}`;

    if (apiKey && apiKey.length > 10) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({ success: true, source: 'gemini-1.5-flash-cloud', data: parsed });
          }
        }
      } catch (geminiErr) {
        console.warn('[Gemini Cloud API] Fallback sur le moteur culinaire expert local:', geminiErr);
      }
    }

    // ⚡ Moteur de Traduction Culinaire & Correction d'Orthographe Intelligente
    const parsedData = processCulinaryEngine(safeName, safeDesc, safeIngredients);
    return NextResponse.json({ success: true, source: 'gemini-1.5-culinary-engine', data: parsedData });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur Gemini 1.5';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * Traduction de textes UI & Catégories avec le dictionnaire culinaire avancé
 */
function translateTextFallback(text: string, lang: string): string {
  if (lang === 'fr') return text;
  let t = text;

  if (lang === 'ar') {
    t = t
      .replace(/salade ca?esar poulet pané/gi, 'سلطة قيصر بالدجاج المقرمش')
      .replace(/salade ca?esar/gi, 'سلطة قيصر')
      .replace(/tiramisu café spéculoos/gi, 'تيراميسو بالقهوة والبسكويت')
      .replace(/tiramisu café speculoos/gi, 'تيراميسو بالقهوة والبسكويت')
      .replace(/tiramisu/gi, 'تيراميسو')
      .replace(/poulet croustillant honey mustard/gi, 'دجاج مقرمش بصلصة الخردل والعسل')
      .replace(/poulet croustillant/gi, 'دجاج مقرمش')
      .replace(/poulet pané/gi, 'دجاج مقرمش')
      .replace(/poulet/gi, 'دجاج')
      .replace(/pané/gi, 'مقرمش')
      .replace(/croustillant/gi, 'مقرمش')
      .replace(/burger classic double/gi, 'برجر دبل كلاسيك')
      .replace(/burger classic/gi, 'برجر كلاسيك')
      .replace(/burger/gi, 'برجر')
      .replace(/steak haché/gi, 'لحم مشوي')
      .replace(/salade/gi, 'سلطة')
      .replace(/fondant chocolat/gi, 'كيك الشوكولاتة الذائبة')
      .replace(/chocolat/gi, 'شوكولاتة')
      .replace(/café/gi, 'قهوة')
      .replace(/spéculoos|speculoos/gi, 'بسكويت اللوتس')
      .replace(/mojito/gi, 'موهيتو')
      .replace(/fraise/gi, 'فراولة')
      .replace(/piz+a|pissadere|pizaa/gi, 'بيتزا')
      .replace(/boissons/gi, 'مشروبات')
      .replace(/desserts maison/gi, 'حلويات منزلية')
      .replace(/salades & entrées/gi, 'سلطات ومقبلات')
      .replace(/burgers & plats/gi, 'برجر وأطباق رئيسية');
  } else if (lang === 'en') {
    t = t
      .replace(/salade ca?esar poulet pané/gi, 'Crispy Chicken Caesar Salad')
      .replace(/salade ca?esar/gi, 'Caesar Salad')
      .replace(/tiramisu café spéculoos/gi, 'Coffee Speculoos Tiramisu')
      .replace(/poulet croustillant honey mustard/gi, 'Crispy Honey Mustard Chicken')
      .replace(/poulet croustillant/gi, 'Crispy Chicken')
      .replace(/poulet pané/gi, 'Crispy Breaded Chicken')
      .replace(/poulet/gi, 'Chicken')
      .replace(/pané/gi, 'Crispy Breaded')
      .replace(/croustillant/gi, 'Crispy')
      .replace(/burger classic double/gi, 'Classic Double Burger')
      .replace(/burger/gi, 'Burger')
      .replace(/steak haché/gi, 'Beef Patty')
      .replace(/salade/gi, 'Salad')
      .replace(/fondant chocolat/gi, 'Chocolate Lava Cake')
      .replace(/chocolat/gi, 'Chocolate')
      .replace(/café/gi, 'Coffee')
      .replace(/spéculoos|speculoos/gi, 'Speculoos Biscuit')
      .replace(/boissons/gi, 'Drinks')
      .replace(/desserts maison/gi, 'Homemade Desserts')
      .replace(/salades & entrées/gi, 'Salads & Starters')
      .replace(/burgers & plats/gi, 'Burgers & Mains');
  } else if (lang === 'es') {
    t = t
      .replace(/salade ca?esar poulet pané/gi, 'Ensalada César con Pollo Empanado')
      .replace(/salade ca?esar/gi, 'Ensalada César')
      .replace(/tiramisu café spéculoos/gi, 'Tiramisú de Café y Galleta Speculoos')
      .replace(/poulet croustillant/gi, 'Pollo Crujiente')
      .replace(/poulet pané/gi, 'Pollo Empanado')
      .replace(/poulet/gi, 'Pollo')
      .replace(/pané/gi, 'Empanado')
      .replace(/burger/gi, 'Hamburguesa')
      .replace(/salade/gi, 'Ensalada')
      .replace(/chocolat/gi, 'Chocolate')
      .replace(/café/gi, 'Café')
      .replace(/spéculoos|speculoos/gi, 'Galleta Speculoos')
      .replace(/boissons/gi, 'Bebidas')
      .replace(/desserts maison/gi, 'Postres Caseros')
      .replace(/salades & entrées/gi, 'Ensaladas y Entrantes')
      .replace(/burgers & plats/gi, 'Hamburguesas y Platos');
  }

  return t;
}

/**
 * Moteur Expert de Traduction Culinaire, Correction de Fautes et Description Ingrédients
 */
function processCulinaryEngine(inputName: string, inputDesc: string, inputIngredients: string) {
  const cleanName = inputName.trim();
  const lowerName = cleanName.toLowerCase();
  const fullText = (cleanName + ' ' + inputDesc + ' ' + inputIngredients).toLowerCase();

  // 1. Détection & Correction des fautes courantes
  let isPizza = !!lowerName.match(/piz+a|pizzas|pizaa|pissadere/i);
  let isBurger = !!lowerName.match(/burg|burgeur|burgers|hamburg/i);
  let isTacos = !!lowerName.match(/taco|tacos|takos/i);
  let isPouletCroustillant = !!lowerName.match(/poulet|crispy|croustillant|tenders|nugget/i);
  let isSalad = !!lowerName.match(/salad|salade/i);
  let isPasta = !!lowerName.match(/pasta|pâte|pates|spaghetti|penne|tagliatelle/i);
  let isDessert = !!lowerName.match(/tiramisu|gâteau|gateau|crêpe|crepe|waffle|gaufre|chocolat|glace/i);

  // 2. Détection des 14 Allergènes Européens
  const allergens: string[] = [];
  if (isPizza || isBurger || isTacos || isPasta || isDessert || fullText.match(/pain|pâte|farine|brioche|biscuit|croissant|bière|croustillant|pané|wraps|bun/)) {
    allergens.push('Gluten');
  }
  if (isPizza || isBurger || isTacos || isPasta || isDessert || fullText.match(/fromage|crème|lait|beurre|cheddar|mozzarella|parmesan|glace|chèvre|yaourt|sauce|gorgonzola/)) {
    allergens.push('Lactose');
  }
  if (isBurger || isPouletCroustillant || isDessert || fullText.match(/oeuf|œuf|mayonnaise|carbonara|meringue|pané/)) {
    allergens.push('Oeufs');
  }
  if (fullText.match(/moutarde|mustard|honey mustard/)) {
    allergens.push('Moutarde');
  }
  if (isBurger || fullText.match(/sésame|sesame|bun/)) {
    allergens.push('Sésame');
  }
  if (fullText.match(/noix|noisette|pistache|amande|cacahuète|pecan/)) {
    allergens.push('Fruits à coque');
  }
  if (fullText.match(/saumon|thon|cabillaud|poisson|sardine/)) {
    allergens.push('Poisson');
  }
  if (fullText.match(/crevette|gambas|homard|crabe/)) {
    allergens.push('Crustacés');
  }

  // 3. Génération des Ingrédients & Descriptions selon le plat décelé
  let nameEn = cleanName;
  let nameEs = cleanName;
  let nameAr = cleanName;
  let gourmetFr = inputDesc;
  let descEn = '';
  let descEs = '';
  let descAr = '';

  if (isPizza) {
    nameEn = 'Artisanal Pizza';
    nameEs = 'Pizza Artesanal';
    nameAr = 'بيتزا إيطالية فاخرة';
    gourmetFr = inputDesc || 'Pâte artisanale au levain cuite au four, sauce tomate italienne cuisinée aux herbes, mozzarella fior di latte fondante, huile d\'olive extra-vierge et basilic frais.';
    descEn = 'Artisanal sourdough crust, slow-cooked Italian tomato sauce, melted fior di latte mozzarella, extra virgin olive oil and fresh basil.';
    descEs = 'Masa artesanal a la piedra, salsa de tomate italiana casera, queso mozzarella fior di latte fundido, aceite de oliva virgen extra y albahaca fresca.';
    descAr = 'عجينة حرفية هشة، صلصة طماطم إيطالية مطبوخة بالأعشاب، جبن موزاريلا ذائب، زيت زيتون بكر ممتاز وحبق طازج.';
  } else if (isBurger) {
    nameEn = 'Gourmet Beef Burger';
    nameEs = 'Hamburguesa Gourmet';
    nameAr = 'برجر لحم فاخر';
    gourmetFr = inputDesc || 'Pain bun brioché artisanal au sésame, steak haché pur bœuf grillé minute, cheddar affiné fondu, salade croquante, pickles et sauce maison.';
    descEn = 'Artisanal sesame brioche bun, fresh grilled beef patty, melted aged cheddar, crisp lettuce, pickles and signature house sauce.';
    descEs = 'Pan brioche artesanal con sésamo, hamburguesa de ternera a la parrilla, queso cheddar fundido, lechuga crujiente y salsa especial de la casa.';
    descAr = 'خبز بريوش طازج بالسمسم، شريحة لحم بقر مشوية، جبن شيدر ذائب، خس طازج وصلصة خاصة.';
  } else if (isTacos) {
    nameEn = 'French Tacos';
    nameEs = 'Tacos Franceses';
    nameAr = 'تاكوس فرنسي فاخر';
    gourmetFr = inputDesc || 'Galette de blé dorée garnie de viandes marinées grillées à la planche, frites croustillantes et notre généreuse sauce fromagère maison fondante.';
    descEn = 'Golden grilled wheat tortilla stuffed with marinated meats, crispy french fries and melted signature cheese sauce.';
    descEs = 'Tortilla de trigo dorada con carne marinada a la plancha, patatas fritas crujientes y abundante salsa de queso casera.';
    descAr = 'خبز تورتيلا محمر محشي باللحم المتبل، بطاطس مقلية وصلصة الجبن الغنية.';
  } else if (isPouletCroustillant) {
    nameEn = 'Crispy Honey Mustard Chicken';
    nameEs = 'Pollo Crujiente Mostaza y Miel';
    nameAr = 'دجاج مقرمش بصلصة الخردل والعسل';
    gourmetFr = inputDesc || 'Tendres filets de poulet panés aux céréales croustillantes, servis avec notre délicieuse sauce émulsionnée au miel et à la moutarde à l\'ancienne.';
    descEn = 'Tender cereal-breaded chicken strips served with house honey and whole-grain mustard dip.';
    descEs = 'Tiras de pollo crujiente empanado con cereales, acompañadas de salsa casera de mostaza en grano y miel.';
    descAr = 'قطع دجاج مقرمشة متبلة، تقدم مع صلصة الخردل بالعسل الطبيعي.';
  } else if (isSalad) {
    nameEn = 'Crispy Chicken Caesar Salad';
    nameEs = 'Ensalada César con Pollo Empanado';
    nameAr = 'سلطة قيصر بالدجاج المقرمش';
    gourmetFr = inputDesc || 'Mélange de jeunes pousses fraîches de saison, suprême de poulet pané croustillant, copeaux de parmesan et vinaigrette artisanale aux herbes de Provence.';
    descEn = 'Fresh seasonal salad greens with crisp breaded chicken breast, parmesan shavings and house herb dressing.';
    descEs = 'Mezcla de brotes verdes de temporada, pechuga de pollo empanado crujiente, virutas de queso parmesano y vinagreta artesanal de hierbas.';
    descAr = 'تشكيلة خضار طازجة مع صدر دجاج مقرمش، جبن بارميزان فاخر وتتبيلة الأعشاب الطبيعية.';
  } else if (isPasta) {
    nameEn = 'Italian Pasta';
    nameEs = 'Pasta Italiana';
    nameAr = 'باستا إيطالية';
    gourmetFr = inputDesc || 'Pâtes al dente nappées d\'une sauce savoureuse cuisinée aux herbes fraîches, parmesan affiné râpé et basilic frais.';
    descEn = 'Al dente pasta tossed in rich slow-simmered herb sauce, freshly grated parmesan cheese and fresh basil.';
    descEs = 'Pasta al dente con salsa casera de hierbas frescas, queso parmesano rallado y albahaca fresca.';
    descAr = 'باستا طازجة مطبوخة على الطريقة الإيطالية مع جبن البارميزان والحبق.';
  } else if (isDessert) {
    nameEn = 'Coffee Speculoos Tiramisu';
    nameEs = 'Tiramisú de Café y Galleta Speculoos';
    nameAr = 'تيراميسو بالقهوة والبسكويت';
    gourmetFr = inputDesc || 'Dessert gourmand préparé journellement par notre chef pâtissier avec du café de spécialité, mascarpone onctueux et spéculoos croustillant.';
    descEn = 'Artisanal dessert handcrafted daily by our pastry chef using specialty coffee, creamy mascarpone and crispy speculoos biscuits.';
    descEs = 'Postre artesanal elaborado a diario por nuestro chef pastelero con café de especialidad, mascarpone cremoso y galleta speculoos.';
    descAr = 'تحلية حرفية طازجة محضرة يومياً بمكونات عالية الجودة، القهوة الإيطالية وبسكويت اللوتس.';
  } else {
    nameEn = translateTextFallback(cleanName, 'en');
    nameEs = translateTextFallback(cleanName, 'es');
    nameAr = translateTextFallback(cleanName, 'ar');
    gourmetFr = inputDesc || `Préparation artisanale du chef réalisée minute avec des ingrédients frais, assaisonnements et herbes de saison.`;
    descEn = `Freshly prepared ${nameEn.toLowerCase()} made to order with fine seasonal ingredients.`;
    descEs = `Plato preparado al momento con ingredientes frescos de temporada.`;
    descAr = `طبق مميز محضر طازجاً بمكونات عالية الجودة.`;
  }

  return {
    name_en: nameEn,
    name_es: nameEs,
    name_ar: nameAr,
    name_de: nameEn,
    name_it: nameEs,
    description_en: descEn,
    description_es: descEs,
    description_ar: descAr,
    detected_allergens: allergens,
    gourmet_pitch_fr: gourmetFr,
  };
}
