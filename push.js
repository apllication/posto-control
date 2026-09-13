(function(){
  const cfg=window.POSTO_CONTROL_SUPABASE;
  const KEY='BLXxEuh6FOt1vxDjIRlMn_fI07aPqwzncm6Y_AfvpAS_I9wXBnDOMWooKAjZk_53cqbi9ruev4r4Z5C35-DHy7I';
  const bytes=s=>{const p='='.repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0))};
  async function register(){
    if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window)||Notification.permission!=='granted')return;
    const c=window.supabase.createClient(cfg.url,cfg.publishableKey),{data}=await c.auth.getSession(),session=data&&data.session;if(!session)return;
    const {data:p}=await c.from('profiles').select('role').eq('id',session.user.id).maybeSingle();if(p?.role!=='manager')return;
    const r=await navigator.serviceWorker.ready;let s=await r.pushManager.getSubscription();if(!s)s=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(KEY)});
    await c.functions.invoke('push-manager',{body:{action:'subscribe',subscription:s.toJSON()}});
  }
  async function supervisor(){
    if(!('serviceWorker' in navigator))return;const c=window.supabase.createClient(cfg.url,cfg.publishableKey),{data}=await c.auth.getSession(),session=data&&data.session;if(!session)return;
    const {data:p}=await c.from('profiles').select('role').eq('id',session.user.id).maybeSingle();if(p?.role!=='supervisor')return;
    c.channel('push-calls').on('postgres_changes',{event:'INSERT',schema:'public',table:'manager_calls'},e=>c.functions.invoke('push-manager',{body:{action:'call',station:e.new.station}})).subscribe();
  }
  setInterval(register,5000);setInterval(supervisor,10000);window.addEventListener('load',()=>{register();supervisor()});
})();
