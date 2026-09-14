(function(){
  'use strict';
  const STORAGE_DISMISSED='hossna_newsletter_dismissed_at';
  const STORAGE_SUBSCRIBED='hossna_newsletter_subscribed';
  const DISMISS_DAYS=10;
  const now=Date.now();
  const day=86400000;

  const subscribed=localStorage.getItem(STORAGE_SUBSCRIBED)==='1';
  const dismissedAt=Number(localStorage.getItem(STORAGE_DISMISSED)||0);
  const dismissedRecently=dismissedAt && (now-dismissedAt)<DISMISS_DAYS*day;

  const modal=document.createElement('div');
  modal.className='newsletter-modal';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`
    <div class="newsletter-modal__backdrop" data-newsletter-close></div>
    <section class="newsletter-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="newsletter-title">
      <button class="newsletter-modal__close" type="button" aria-label="Fermer" data-newsletter-close>×</button>
      <div class="newsletter-modal__visual" aria-hidden="true">
        <span class="newsletter-modal__script">La lettre de Housna</span>
        <div class="newsletter-modal__orb newsletter-modal__orb--1"></div>
        <div class="newsletter-modal__orb newsletter-modal__orb--2"></div>
        <div class="newsletter-modal__mark">H</div>
      </div>
      <div class="newsletter-modal__content">
        <span class="mono-cap">La lettre Hossnadharma</span>
        <h2 id="newsletter-title">Et si votre boîte mail devenait aussi un endroit où <em>ralentir ?</em></h2>
        <p>Je vous écris autour du corps, de la santé, du féminin, de l’Ayurveda et de ce qui mérite parfois d’être regardé autrement.</p>
        <p class="newsletter-modal__promise">Pas de mails pour remplir votre boîte. J’écris quand il y a quelque chose à partager.</p>
        <form class="newsletter-form" novalidate>
          <div class="newsletter-form__row">
            <label><span>Prénom <small>(facultatif)</small></span><input type="text" name="firstName" autocomplete="given-name" placeholder="Votre prénom"></label>
            <label><span>Email</span><input type="email" name="email" autocomplete="email" placeholder="vous@exemple.fr" required></label>
          </div>
          <label class="newsletter-consent"><input type="checkbox" name="consent" required><span>J’accepte de recevoir la newsletter Hossnadharma par email. Je pourrai me désinscrire à tout moment.</span></label>
          <button class="btn btn--clay btn--lg newsletter-submit" type="submit">Je veux recevoir les lettres →</button>
          <p class="newsletter-form__status" role="status" aria-live="polite"></p>
        </form>
      </div>
    </section>`;
  document.body.appendChild(modal);

  const inline=document.createElement('section');
  inline.className='newsletter-inline';
  inline.innerHTML=`
    <div class="container">
      <div class="newsletter-inline__panel reveal">
        <div><span class="mono-cap mono-cap--light">La lettre Hossnadharma</span><h2>Des mots à garder près de soi.</h2><p>Corps, santé, féminin, Ayurveda, mouvement et réflexions de terrain — directement dans votre boîte mail.</p></div>
        <button class="btn newsletter-open-btn" type="button" data-newsletter-open>Recevoir la lettre →</button>
      </div>
    </div>`;
  const footer=document.querySelector('.footer');
  if(footer) footer.parentNode.insertBefore(inline,footer);

  const floating=document.createElement('button');
  floating.type='button';
  floating.className='newsletter-float';
  floating.setAttribute('data-newsletter-open','');
  floating.innerHTML='<span>✦</span> Recevoir la lettre';
  document.body.appendChild(floating);

  function openModal(){
    if(subscribed) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('newsletter-lock');
    setTimeout(()=>modal.querySelector('input[name="email"]')?.focus(),100);
  }
  function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('newsletter-lock');
    localStorage.setItem(STORAGE_DISMISSED,String(Date.now()));
  }
  document.addEventListener('click',e=>{
    const opener=e.target.closest('[data-newsletter-open]');
    if(opener){e.preventDefault();openModal();return;}
    if(e.target.closest('[data-newsletter-close]')) closeModal();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))closeModal();});

  if(subscribed){
    floating.style.display='none';
    inline.style.display='none';
  }else if(!dismissedRecently){
    let fired=false;
    const trigger=()=>{if(fired)return;fired=true;openModal();window.removeEventListener('scroll',onScroll);};
    const onScroll=()=>{
      const h=document.documentElement.scrollHeight-window.innerHeight;
      if(h>0 && window.scrollY/h>.42) trigger();
    };
    window.addEventListener('scroll',onScroll,{passive:true});
    setTimeout(trigger,9000);
  }

  const form=modal.querySelector('.newsletter-form');
  const submit=form.querySelector('.newsletter-submit');
  const status=form.querySelector('.newsletter-form__status');

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!form.reportValidity()) return;
    const data=new FormData(form);
    submit.disabled=true;
    submit.textContent='Inscription en cours…';
    status.textContent='';
    try{
      const res=await fetch('/api/newsletter',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          email:String(data.get('email')||'').trim(),
          firstName:String(data.get('firstName')||'').trim(),
          consent:data.get('consent')==='on',
          source:location.pathname,
          pageTitle:document.title,
          subscribedAt:new Date().toISOString()
        })
      });
      const payload=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(payload.message||'Impossible de finaliser l’inscription pour le moment.');
      localStorage.setItem(STORAGE_SUBSCRIBED,'1');
      localStorage.removeItem(STORAGE_DISMISSED);
      status.textContent='Bienvenue. Votre inscription est bien enregistrée.';
      submit.textContent='Inscription confirmée ✓';
      floating.style.display='none';
      inline.style.display='none';
      setTimeout(()=>{modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('newsletter-lock');},1800);
    }catch(err){
      status.textContent=err.message||'Une erreur est survenue. Réessayez dans quelques instants.';
      submit.disabled=false;
      submit.textContent='Je veux recevoir les lettres →';
    }
  });
})();