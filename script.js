// FISAT front-end interactions – pure HTML/CSS/JS, no backend
(function(){
  const $ = (s, c=document)=>c.querySelector(s);
  const $$ = (s, c=document)=>[...c.querySelectorAll(s)];

  // 1. Sticky header shadow + mobile nav
  const header = $('#header'), nav = $('#nav'), burger = $('#hamburger');
  burger.addEventListener('click', ()=> nav.classList.toggle('open'));
  $$('#nav a').forEach(a=>a.addEventListener('click', ()=> nav.classList.remove('open')));
  window.addEventListener('scroll', ()=>{
    header.style.boxShadow = window.scrollY>10 ? '0 6px 24px rgba(0,0,0,.12)' : 'none';
    $('#topBtn').style.display = window.scrollY>600 ? 'inline-block' : 'none';
    // active link highlight
    const secs = ['home','about','programs','departments','facilities','placements','news','contact'];
    let cur='home';
    secs.forEach(id=>{ const el=document.getElementById(id); if(el && window.scrollY >= el.offsetTop-160) cur=id; });
    $$('#nav a').forEach(a=>a.classList.toggle('active', a.getAttribute('href')==='#'+cur));
  }, {passive:true});

  // 2. Hero video + thumbs (slider removed)
  const track=$('#tickerTrack');
  if(track && !track.dataset.dup){ track.innerHTML+=track.innerHTML; track.dataset.dup='1'; }
  const heroPoster = $('.hero-poster');
  const heroVideo = $('#heroVideo');
  const thumbs = $$('.hero-thumbs .thumb');
  // If campus.mp4 missing, video tag hides itself and poster stays (no broken UI)
  if(heroVideo){
    heroVideo.addEventListener('error',()=>heroVideo.style.display='none',true);
    const src = heroVideo.querySelector('source');
    if(src){ src.addEventListener('error',()=>heroVideo.style.display='none'); }
    // Auto-hide video if file 404 (keeps poster sharp)
    fetch('images/campus.mp4',{method:'HEAD'}).then(r=>{ if(!r.ok) heroVideo.style.display='none'; }).catch(()=>heroVideo.style.display='none');
  }
  thumbs.forEach(t=>t.addEventListener('click',()=>{
    thumbs.forEach(x=>x.classList.remove('active')); t.classList.add('active');
    const bg=t.dataset.bg;
    if(heroPoster) heroPoster.src=bg;
    const hv=$('#heroVideo'); if(hv) hv.setAttribute('poster',bg);
  }));
  // Legacy slider guard (no-op if removed)
  const slides = $$('#heroSlides .slide');
  const dotsWrap = $('#heroDots');
  if(slides.length && dotsWrap){
    let cur=0, timer;
    slides.forEach((_,i)=>{
      const d=document.createElement('button');
      d.setAttribute('aria-label','Go to slide '+(i+1));
      if(i===0) d.classList.add('active');
      d.addEventListener('click',()=>go(i,true));
      dotsWrap.appendChild(d);
    });
    const dots = $$('#heroDots button');
    function go(i,manual=false){
      slides[cur].classList.remove('active'); dots[cur].classList.remove('active');
      cur=(i+slides.length)%slides.length;
      slides[cur].classList.add('active'); dots[cur].classList.add('active');
      if(manual) restart();
    }
    function restart(){ clearInterval(timer); timer=setInterval(()=>go(cur+1),6000); }
    const pv=$('#prevSlide'), nx=$('#nextSlide');
    if(pv) pv.addEventListener('click',()=>go(cur-1,true));
    if(nx) nx.addEventListener('click',()=>go(cur+1,true));
    restart();
  }

  // 3. Animated counters
  const counters = $$('.counter');
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target, target=+el.dataset.target; io.unobserve(el);
      const t0=performance.now(), dur=1400;
      (function tick(t){
        const p=Math.min((t-t0)/dur,1), v=Math.floor(target*(1-Math.pow(1-p,3)));
        el.textContent=v.toLocaleString('en-IN');
        if(p<1) requestAnimationFrame(tick);
      })(t0);
    });
  },{threshold:.5});
  counters.forEach(c=>io.observe(c));

  // 4. Program filter tabs
  $$('#programTabs .tab').forEach(t=>t.addEventListener('click',()=>{
    $$('#programTabs .tab').forEach(x=>x.classList.remove('active')); t.classList.add('active');
    const f=t.dataset.filter;
    $$('#programGrid .card').forEach(card=>{
      const show = f==='all' || card.dataset.cat===f;
      card.style.display = show ? '' : 'none';
    });
  }));

  // 5. News filter tabs
  $$('#newsTabs .tab').forEach(t=>t.addEventListener('click',()=>{
    $$('#newsTabs .tab').forEach(x=>x.classList.remove('active')); t.classList.add('active');
    const f=t.dataset.nfilter;
    $$('#newsGrid .ncard').forEach(card=>{
      const show = f==='all' || card.dataset.ncat===f;
      card.style.display = show ? '' : 'none';
    });
  }));

  // 6. Dept horizontal scroll buttons
  const scroller = $('#deptScroll');
  $('#deptPrev').addEventListener('click',()=>scroller.scrollBy({left:-300,behavior:'smooth'}));
  $('#deptNext').addEventListener('click',()=>scroller.scrollBy({left:300,behavior:'smooth'}));

  // 7. Testimonials rotator
  const data=[
    {t:'“FISAT’s placement training and coding clubs made cracking TCS Digital easy. Mock interviews helped a lot.”',n:'Anjali S. – CSE, TCS Digital',r:'Class of 2025 • 7 LPA',a:'AS'},
    {t:'“Idea Lab + Robotics Lab let us build Agrobot DAWN from scratch. Faculty mentorship is excellent.”',n:'Rahul Menon – EEE, UST',r:'Class of 2024 • 6 LPA',a:'RM'},
    {t:'“MBA at FISAT gave me live projects, internships and a PPO from Federal Bank. Great ROI.”',n:'Sneha P. – MBA, Federal Bank',r:'Class of 2025 • 8 LPA',a:'SP'},
  ];
  let ti=0;
  const tDots=$('#testiDots');
  data.forEach((_,i)=>{
    const b=document.createElement('button');
    if(i===0) b.classList.add('active');
    b.setAttribute('aria-label','Testimonial '+(i+1));
    b.addEventListener('click',()=>showT(i));
    tDots.appendChild(b);
  });
  function showT(i){
    ti=i;
    $('#testiText').textContent=data[ti].t;
    $('#testiName').textContent=data[ti].n;
    $('#testiRole').textContent=data[ti].r;
    $$('#testiDots button').forEach((d,j)=>d.classList.toggle('active',j===ti));
    document.querySelector('.testi-user .avatar').textContent=data[ti].a;
  }
  setInterval(()=>showT((ti+1)%data.length),5000);

  // 8. Modal for news Read buttons
  const modal=$('#modal');
  $$('[data-read]').forEach(b=>b.addEventListener('click',()=>{
    const card=b.closest('.ncard');
    $('#modalTitle').textContent = card ? card.querySelector('h3').textContent : 'Details';
    $('#modalText').textContent = b.dataset.read;
    modal.classList.add('open');
  }));
  $('#modalX').addEventListener('click',()=>modal.classList.remove('open'));
  modal.addEventListener('click',e=>{ if(e.target===modal) modal.classList.remove('open'); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') modal.classList.remove('open'); });

  // 9. Brochure button demo
  $('#brochureBtn').addEventListener('click',()=>{
    $('#modalTitle').textContent='FISAT Prospectus 2026';
    $('#modalText').textContent='Demo front-end: link your PDF here (e.g. prospectus.pdf). Includes fees, scholarships, hostel, syllabus, placement stats for B.Tech / MBA / MCA / M.Tech.';
    modal.classList.add('open');
  });

  // 10. Admission form validation (front-end only)
  $('#admitForm').addEventListener('submit',e=>{
    e.preventDefault();
    const name=$('#fName').value.trim(), phone=$('#fPhone').value.trim(),
          email=$('#fEmail').value.trim(), prog=$('#fProg').value;
    const err=$('#formErr'), ok=$('#formOk');
    err.textContent=''; ok.textContent='';
    if(name.length<3) return err.textContent='Please enter your full name.';
    if(!/^[6-9]\d{9}$/.test(phone.replace(/\s+/g,''))) return err.textContent='Enter a valid 10-digit Indian mobile number.';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return err.textContent='Enter a valid email address.';
    if(!prog) return err.textContent='Please select a program.';
    if(!$('#fAgree').checked) return err.textContent='Please consent to be contacted.';
    // success – store locally (no backend)
    const enquiries = JSON.parse(localStorage.getItem('fisat_enquiries')||'[]');
    enquiries.push({name,phone,email,prog,msg:$('#fMsg').value.trim(),at:new Date().toISOString()});
    localStorage.setItem('fisat_enquiries',JSON.stringify(enquiries));
    ok.textContent=`Thanks ${name}! Your enquiry for ${prog} is recorded. Our counsellor will call ${phone} shortly.`;
    e.target.reset(); $('#fAgree').checked=true;
  });

  // 11. Back to top + smooth anchor offset for sticky header
  $('#topBtn').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();
