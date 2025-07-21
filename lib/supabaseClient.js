import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qzzfpjnucckodqcnmcrl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6emZwam51Y2Nrb2RxY25tY3JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwOTM5NjAsImV4cCI6MjA2ODY2OTk2MH0.plNyAVkQNqveEC_oINVhEHvkSQl1bBvVjCH2p9NE0H0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 