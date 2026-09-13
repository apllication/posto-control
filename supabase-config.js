// Posto Control — configuração pública do Supabase.
// A chave abaixo é Publishable/anon e só é segura no frontend porque o banco usa RLS.
window.POSTO_CONTROL_SUPABASE = {
  url: 'https://rgxnehdeqfdmpagtcvte.supabase.co',
  publishableKey: 'sb_publishable_FFyp5SGfLXxb7q4Hw-u6hg_UUnC_moB'
};
const postoPushScript=document.createElement('script');
postoPushScript.src='push.js';
document.head.appendChild(postoPushScript);
