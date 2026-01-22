const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://vuvholhphyfqckoyreck.supabase.co';
const supabaseAnonKey = 'sb_publishable_22s6nmTdeYifFN97ynWThA_BHSzhbPc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLists() {
    console.log("Fetching all lists...");
    const { data: lists, error } = await supabase
        .from('lists')
        .select('id, title, visibility, owner_id');

    if (error) {
        console.error("Error fetching lists:", error);
        return;
    }

    console.log(`Found ${lists.length} lists:`);
    lists.forEach(list => {
        console.log(`- [${list.visibility}] "${list.title}" (ID: ${list.id})`);
    });

    console.log("\nChecking fetchPublicLists query result:");
    const { data: publicLists, error: publicError } = await supabase
        .from('lists')
        .select('id, title, visibility')
        .eq('visibility', 'public');

    if (publicError) {
        console.error("Error fetching public lists:", publicError);
        return;
    }

    console.log(`fetchPublicLists found ${publicLists.length} lists:`);
    publicLists.forEach(list => {
        console.log(`- [${list.visibility}] "${list.title}"`);
    });
}

checkLists();
