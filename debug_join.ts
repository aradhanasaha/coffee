
    const { supabase } = require('./adapters/supabaseClient');
    async function test() {
        try {
            const { data, error } = await supabase.from('coffee_logs').select('*, profiles:user_id(username)').limit(1);
            if (error) {
                console.error('Join Error:', error);
            } else {
                console.log('Join Success, sample:', data && data[0]?.profiles);
            }
        } catch (e) { console.error('Exception:', e); }
    }
    test();

