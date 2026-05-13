import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlxxdrbxcjofttwxbpwr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFseHhkcmJ4Y2pvZnR0d3hicHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTUxMzMsImV4cCI6MjA5NDE3MTEzM30.s9xGl4QUebBUwR6PCFeR4KPsZlpwRgF-1NPdpaQu3zo';
export const supabase = createClient(supabaseUrl, supabaseKey);
