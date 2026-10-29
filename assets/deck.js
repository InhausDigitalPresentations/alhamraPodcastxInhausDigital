(function(){
  var doc=document.documentElement;
  doc.classList.add('js');
  if(/[?&]final\b/.test(location.search)) document.body.classList.add('final');

  /* Image slots: <div class="img" data-src="images/xx.jpg" data-title="..." data-id="01">
     If the file exists it is shown; otherwise a labelled placeholder stays. */
  document.querySelectorAll('.img[data-src]').forEach(function(el){
    var ph=document.createElement('div');ph.className='ph';
    ph.innerHTML='<b>'+(el.dataset.title||'Image')+'</b>IMG '+(el.dataset.id||'')+' · '+el.dataset.src;
    el.appendChild(ph);
    var tag=document.createElement('div');tag.className='tag';tag.textContent='Conceptual visualisation';
    el.appendChild(tag);
    var im=new Image();im.alt=el.dataset.title||'';im.decoding='async';
    im.onload=function(){el.insertBefore(im,el.firstChild);el.classList.add('loaded');};
    im.onerror=function(){if(el.dataset.fallback&&im.src.indexOf(el.dataset.fallback)<0){im.src=el.dataset.fallback;}};
    im.src=el.dataset.src;
  });

  /* YouTube thumbnails for case cards */
  document.querySelectorAll('.thumb[data-yt]').forEach(function(a){
    var id=a.dataset.yt;
    a.style.backgroundImage=(a.dataset.img?'url('+a.dataset.img+'),':'')+'url(https://i.ytimg.com/vi/'+id+'/hqdefault.jpg)';
    a.href='https://www.youtube.com/watch?v='+id;a.target='_blank';a.rel='noopener';
  });

  /* Drive-hosted case films: thumbnail + open the Drive player */
  document.querySelectorAll('.thumb[data-drive]').forEach(function(a){
    var id=a.dataset.drive;
    a.style.backgroundImage=(a.dataset.img?'url('+a.dataset.img+'),':'')+'url(https://drive.google.com/thumbnail?id='+id+'&sz=w1000)';
    a.href='https://drive.google.com/file/d/'+id+'/view';a.target='_blank';a.rel='noopener';
  });

  /* Reference video: thumbnail, plays inline on click (link fallback in PDF) */
  document.querySelectorAll('.refvid[data-yt]').forEach(function(el){
    var id=el.dataset.yt,st=el.dataset.start||0,en=el.dataset.end;
    el.style.backgroundImage='url(https://i.ytimg.com/vi/'+id+'/hqdefault.jpg)';
    el.addEventListener('click',function(e){
      if(el.classList.contains('on'))return;e.preventDefault();
      var f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&start='+st+(en?'&end='+en:'');
      f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;
      el.appendChild(f);el.classList.add('on');
    });
  });

  /* Shot-type clips: muted looping segments played from YouTube (IFrame API).
     The CSS crop stays as poster for print/PDF and if YouTube can't load. */
  var clips=[].slice.call(document.querySelectorAll('.fr[data-yt]'));
  if(clips.length && location.protocol.indexOf('http')===0){
    var started=false;
    function startClips(){
      if(started||!window.YT||!YT.Player)return;started=true;
      clips.forEach(function(fr){
        var s=+fr.dataset.s,e=+fr.dataset.e,host=document.createElement('div');host.className='yt';
        var inner=document.createElement('div');host.appendChild(inner);fr.appendChild(host);
        var p=new YT.Player(inner,{videoId:fr.dataset.yt,host:'https://www.youtube-nocookie.com',
          playerVars:{autoplay:1,mute:1,controls:0,start:s,end:e,playsinline:1,rel:0,modestbranding:1,iv_load_policy:3,disablekb:1,fs:0},
          events:{
            onReady:function(){p.mute();p.seekTo(s,true);p.playVideo();},
            onStateChange:function(ev){
              if(ev.data===1)fr.classList.add('live');
              if(ev.data===0){p.seekTo(s,true);p.playVideo();}
            }}});
        setInterval(function(){try{if(p.getCurrentTime&&p.getCurrentTime()>=e-0.15){p.seekTo(s,true);}}catch(x){}},250);
      });
    }
    window.onYouTubeIframeAPIReady=startClips;
    var obs=new IntersectionObserver(function(es){es.forEach(function(en){
      if(en.isIntersecting&&!document.getElementById('yt-api')){
        var sc=document.createElement('script');sc.id='yt-api';sc.src='https://www.youtube.com/iframe_api';document.head.appendChild(sc);
      }else if(en.isIntersecting){startClips();}
    });},{threshold:.2});
    obs.observe(clips[0].closest('.slide'));
  }

  var slides=[].slice.call(document.querySelectorAll('.slide'));
  var rail=document.querySelector('.rail'),counter=document.querySelector('.counter'),bar=document.querySelector('.progress');
  slides.forEach(function(s,i){
    if(!s.id) s.id='s'+(i+1);
    var a=document.createElement('a');a.href='#'+s.id;a.title=s.dataset.label||('Slide '+(i+1));rail.appendChild(a);
  });
  var dots=rail.querySelectorAll('a'),cur=0;
  function set(i){
    cur=i;dots.forEach(function(d,j){d.classList.toggle('on',j===i)});
    counter.textContent=String(i+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
    bar.style.width=((i+1)/slides.length*100)+'%';
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in');if(e.intersectionRatio>.5)set(slides.indexOf(e.target));}
    });
  },{threshold:[.15,.55]});
  slides.forEach(function(s){io.observe(s)});
  setTimeout(function(){slides[0].classList.add('in')},150);
  set(0);

  /* Index menu: built from each slide's data-label; dividers and data-group open a new column */
  var menu=document.getElementById('ix'),mbtn=document.querySelector('.ix-btn'),cols=menu.querySelector('.ix-cols');
  var groups=[],g={title:'Introduction',items:[]};groups.push(g);
  slides.forEach(function(sl,i){
    var lab=sl.dataset.label||('Slide '+(i+1));
    if(sl.classList.contains('divider')){g={title:lab.replace(/^Part [IV]+ · /,''),items:[]};groups.push(g);return;}
    if(sl.dataset.group){g={title:sl.dataset.group,items:[]};groups.push(g);}
    g.items.push({i:i,lab:lab});
  });
  // dividers themselves stay reachable: link the group title to the divider
  groups.forEach(function(gr,gi){
    var col=document.createElement('div');col.className='ix-col';
    var h=document.createElement('h4');h.textContent=(gi?('0'+gi+' · '):'')+gr.title;col.appendChild(h);
    gr.items.forEach(function(it){
      var a=document.createElement('a');a.href='#'+slides[it.i].id;a.dataset.i=it.i;
      var n=document.createElement('span');n.textContent=String(it.i+1).padStart(2,'0');a.appendChild(n);
      a.appendChild(document.createTextNode(it.lab));
      a.addEventListener('click',function(e){e.preventDefault();closeMenu();slides[it.i].scrollIntoView({behavior:'smooth'});});
      col.appendChild(a);
    });
    cols.appendChild(col);
  });
  function openMenu(){menu.hidden=false;requestAnimationFrame(function(){menu.classList.add('open')});mbtn.setAttribute('aria-expanded','true');
    menu.querySelectorAll('.ix-col a').forEach(function(a){a.classList.toggle('on',+a.dataset.i===cur)});}
  function closeMenu(){menu.classList.remove('open');mbtn.setAttribute('aria-expanded','false');setTimeout(function(){menu.hidden=true},250);}
  mbtn.addEventListener('click',function(){menu.hidden?openMenu():closeMenu()});
  menu.querySelector('.ix-x').addEventListener('click',closeMenu);
  menu.addEventListener('click',function(e){if(e.target===menu)closeMenu()});
  document.addEventListener('keydown',function(e){
    if(e.key==='m'||e.key==='M'){e.preventDefault();menu.hidden?openMenu():closeMenu();return;}
    if(e.key==='Escape'&&!menu.hidden){closeMenu();}
  });

  document.addEventListener('keydown',function(e){
    if(!menu.hidden)return;
    var k=e.key,n=null;
    if(k==='ArrowDown'||k==='PageDown'||k==='ArrowRight'||k===' ') n=Math.min(cur+1,slides.length-1);
    if(k==='ArrowUp'||k==='PageUp'||k==='ArrowLeft') n=Math.max(cur-1,0);
    if(k==='Home') n=0; if(k==='End') n=slides.length-1;
    if(n!==null){e.preventDefault();slides[n].scrollIntoView({behavior:'smooth'});}
  });
  window.addEventListener('beforeprint',function(){slides.forEach(function(s){s.classList.add('in')})});
})();
