const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ypimdbkiuguiszaddzaj.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwaW1kYmtpdWd1aXN6YWRkemFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU5MTg4NiwiZXhwIjoyMDkwMTY3ODg2fQ.Q8syF6pO-v2Wd0VaBc0Q8iR4iXeWMEePoYnNlCrsKF8";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const tenantId = "00000000-0000-0000-0000-000000000001";
  
  console.log(`Querying profiles for tenant: ${tenantId}`);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('tenant_id', tenantId);
    
  if (error) {
    console.error("Error querying profiles:", error);
  } else {
    console.log("Profiles found in Supabase:", JSON.stringify(data, null, 2));
  }
}

main();
