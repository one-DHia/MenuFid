const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' }); // Charge les variables de .env.local

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Erreur : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createFirstAdmin() {
  const email = 'dhia@menufid.site'; // Remplace par ton email
  const password = 'SuperPassword123!'; // Remplace par ton mot de passe (très complexe de préférence)

  console.log(`Création du Super-Admin : ${email}...`);

  // 1. Créer l'utilisateur dans l'authentification Supabase (auth.users)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Auto-confirme l'email
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
        console.log("⚠️ Cet utilisateur existe déjà dans l'authentification Supabase.");
    } else {
        console.error("❌ Erreur lors de la création Auth :", authError);
        return;
    }
  }

  // 2. Ajouter l'utilisateur dans la table `public.admins`
  // Si l'utilisateur existait déjà, on récupère son ID via une requête getUser
  let userId = authData?.user?.id;
  
  if (!userId) {
     const { data: users, error: listError } = await supabase.auth.admin.listUsers();
     const user = users?.users.find(u => u.email === email);
     if (user) userId = user.id;
  }

  if (userId) {
    const { error: dbError } = await supabase
      .from('admins')
      .upsert({
        id: userId,
        email: email,
        role: 'superadmin'
      });

    if (dbError) {
      console.error("❌ Erreur lors de l'ajout dans la table 'admins' :", dbError);
    } else {
      console.log("✅ Super-Admin ajouté avec succès dans la table 'admins' !");
      console.log(`Tu peux te connecter sur /admin/login avec l'email : ${email}`);
    }
  } else {
      console.error("❌ Impossible de trouver l'ID de l'utilisateur pour l'ajouter à la table admins.");
  }
}

createFirstAdmin();
