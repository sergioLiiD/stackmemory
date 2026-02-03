const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- Checking Projects ---');
    const { data: projects, error } = await supabase.from('projects').select('id, name');
    if (error) {
        console.error('Error fetching projects:', error);
        return;
    }
    console.log('Projects found:', projects);

    const targetId = 'cb83840b-fdc0-415a-9eda-0943b13f1b10';
    console.log(`\n--- Checking Documents for ${targetId} ---`);

    const { count, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', targetId);

    if (countError) {
        console.error('Error counting documents:', countError);
    } else {
        console.log(`Total indexed documents: ${count}`);
    }
}

check();
