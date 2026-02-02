
    const { supabase } = require('./adapters/supabaseClient');
    async function test() {
        const { data: log, error } = await supabase.from('coffee_logs').select('location_id, place').not('location_id', 'is', null).limit(1).single();
        if(error) console.error('Log Error:', error);
        console.log('Log:', log);
        if (log && log.location_id) {
            const { data: loc, error: locError } = await supabase.from('locations').select('*').eq('id', log.location_id).single();
            if(locError) console.error('Loc Error:', locError);
            console.log('Location Table Lookup:', loc);
        }
    }
    test();

