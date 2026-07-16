/* =========================================================
   $PONSWIFHAT — site interactions
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  buildFeatherField();
  wireCopyButtons();
  wireMobileNav();
  wireHatBooth();
});

/* ---------------- ambient feather field ---------------- */
function buildFeatherField(){
  const field = document.querySelector('.feather-field');
  if(!field) return;
  const count = window.innerWidth < 640 ? 10 : 18;
  for(let i=0;i<count;i++){
    const f = document.createElement('span');
    f.className = 'feather';
    f.textContent = '🍃';
    f.style.left = Math.random()*100 + 'vw';
    f.style.animationDelay = (Math.random()*18) + 's';
    f.style.animationDuration = (14 + Math.random()*10) + 's';
    f.style.fontSize = (16 + Math.random()*18) + 'px';
    field.appendChild(f);
  }
}

/* ---------------- copy-to-clipboard ---------------- */
function wireCopyButtons(){
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy');
      try{
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = original, 1600);
      }catch(e){
        alert('Copy failed — please copy manually: ' + text);
      }
    });
  });
}

/* ---------------- mobile nav ---------------- */
function wireMobileNav(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });
}

/* ---------------- Hat Booth: upload a photo, drop a green WIF hat on it ---------------- */
function wireHatBooth(){
  const dropzone   = document.getElementById('dropzone');
  const fileInput  = document.getElementById('fileInput');
  const urlInput   = document.getElementById('urlInput');
  const urlBtn     = document.getElementById('urlBtn');
  const stageWrap  = document.getElementById('stageWrap');
  const canvas     = document.getElementById('stageCanvas');
  const controls   = document.getElementById('hatControls');
  const scaleRange = document.getElementById('hatScale');
  const rotRange   = document.getElementById('hatRotate');
  const resetBtn   = document.getElementById('resetHat');
  const downloadBtn= document.getElementById('downloadBtn');
  const newPhotoBtn= document.getElementById('newPhotoBtn');
  const noteEl     = document.getElementById('boothNote');

  if(!dropzone || !canvas) return;

  const ctx = canvas.getContext('2d');
  const HAT_SRC = 'assets/hat.png';
  const hatImg = new Image();
  hatImg.src = HAT_SRC;

  let baseImg = null;
  let baseDrawW = 0, baseDrawH = 0, baseOffX = 0, baseOffY = 0;
  let canvasTainted = false;

  // hat transform state, in canvas-pixel space
  let hat = { x: 0, y: 0, scale: 1, rotation: 0, baseW: 0, baseH: 0 };

  function fitCanvasToImage(img){
    // square stage — cover-fit the source photo
    const size = 900;
    canvas.width = size;
    canvas.height = size;
    const ir = img.width / img.height;
    if(ir > 1){
      baseDrawH = size;
      baseDrawW = size * ir;
      baseOffX = (size - baseDrawW) / 2;
      baseOffY = 0;
    } else {
      baseDrawW = size;
      baseDrawH = size / ir;
      baseOffX = 0;
      baseOffY = (size - baseDrawH) / 2;
    }
  }

  function resetHatPosition(){
    const hr = hatImg.width / hatImg.height;
    hat.baseW = canvas.width * 0.5;
    hat.baseH = hat.baseW / hr;
    hat.scale = 1;
    hat.rotation = -6;
    hat.x = canvas.width * 0.5;
    hat.y = canvas.height * 0.34;
    scaleRange.value = 100;
    rotRange.value = -6;
  }

  function render(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    if(baseImg){
      ctx.drawImage(baseImg, baseOffX, baseOffY, baseDrawW, baseDrawH);
    }
    if(hatImg.complete && hatImg.naturalWidth){
      const w = hat.baseW * hat.scale;
      const h = hat.baseH * hat.scale;
      ctx.save();
      ctx.translate(hat.x, hat.y);
      ctx.rotate(hat.rotation * Math.PI/180);
      ctx.drawImage(hatImg, -w/2, -h/2, w, h);
      ctx.restore();
    }
  }

  function loadImageToStage(img){
    baseImg = img;
    fitCanvasToImage(img);
    resetHatPosition();
    stageWrap.classList.add('active');
    controls.classList.add('active');
    dropzone.style.display = 'none';
    downloadBtn.disabled = false;
    render();
  }

  function loadFromFile(file){
    if(!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => { canvasTainted = false; loadImageToStage(img); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function loadFromURL(url){
    if(!url) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { canvasTainted = false; loadImageToStage(img); };
    img.onerror = () => {
      noteEl.textContent = "Couldn't load that image directly (the site may block outside access). Save the picture to your device and upload the file instead.";
    };
    img.src = url;
  }

  // drag & drop / click upload
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag');
    const file = e.dataTransfer.files[0];
    loadFromFile(file);
  });
  fileInput.addEventListener('change', (e) => loadFromFile(e.target.files[0]));

  if(urlBtn){
    urlBtn.addEventListener('click', () => loadFromURL(urlInput.value.trim()));
  }

  // pointer drag to move hat
  let dragging = false;
  let lastX = 0, lastY = 0;

  function canvasPoint(evt){
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener('pointerdown', (e) => {
    if(!baseImg) return;
    dragging = true;
    const p = canvasPoint(e);
    lastX = p.x; lastY = p.y;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if(!dragging) return;
    const p = canvasPoint(e);
    hat.x += (p.x - lastX);
    hat.y += (p.y - lastY);
    lastX = p.x; lastY = p.y;
    render();
  });
  ['pointerup','pointercancel','pointerleave'].forEach(ev =>
    canvas.addEventListener(ev, () => dragging = false)
  );

  scaleRange && scaleRange.addEventListener('input', () => {
    hat.scale = Number(scaleRange.value) / 100;
    render();
  });
  rotRange && rotRange.addEventListener('input', () => {
    hat.rotation = Number(rotRange.value);
    render();
  });
  resetBtn && resetBtn.addEventListener('click', () => { resetHatPosition(); render(); });

  newPhotoBtn && newPhotoBtn.addEventListener('click', () => {
    baseImg = null;
    stageWrap.classList.remove('active');
    controls.classList.remove('active');
    dropzone.style.display = 'block';
    downloadBtn.disabled = true;
    noteEl.textContent = 'Drop a photo, or paste a direct image URL below, then drag / scale / rotate the hat to fit.';
    fileInput.value = '';
  });

  downloadBtn && downloadBtn.addEventListener('click', () => {
    try{
      const link = document.createElement('a');
      link.download = 'ponswifhat.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }catch(err){
      noteEl.textContent = 'This image is protected and can\'t be exported from a pasted URL. Upload the file directly instead to download your hatted pic.';
    }
  });

  hatImg.onload = () => { if(baseImg) render(); };
}
