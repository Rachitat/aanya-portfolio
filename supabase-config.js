const SUPABASE_URL = "https://mtwzgwxiszukksxjossu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10d3pnd3hpc3p1a2tzeGpvc3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1ODg4MjEsImV4cCI6MjA5NTE2NDgyMX0.BEH1J0HGG8IXeu8gP19s7pl5mqMklJfDtlJY6e78_1I";
// var (not const) so script.js can access this client across separate <script> tags
var supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
