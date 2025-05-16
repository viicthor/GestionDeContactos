// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://luxhnzjexlruhqghdpuq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eGhuempleGxydWhxZ2hkcHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczNzM5ODMsImV4cCI6MjA2Mjk0OTk4M30.o9rkocvDQUf77JzqbJSQtB_T8alsLmI8_hmpVm6Z-jw';

export const supabase = createClient(supabaseUrl, supabaseKey);
