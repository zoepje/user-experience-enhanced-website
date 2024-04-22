//#region Menu
const menuBtn = document.querySelector('.menu-button'),
      // closeBtn = document.querySelector('.close-button'),
      nav = document.querySelector('nav'),
      header = document.querySelector('header');

// Functie uitklappen menu
function toggleMenu(){
  header.classList.toggle('nav-open');
}

// als je klikt op dit element dan voer deze funtie uit.
menuBtn.addEventListener('click', toggleMenu);
//#endregion Menu

//#region Share
const link = encodeURI(window.location.href),
      shareBtn = document.querySelector('.deel-button'),
      shareCount = document.getElementById('share'),
      notificationContainer = document.getElementById('notification-container'),
      notification = document.getElementById('notification');
  

function betterAlert(message) { // Deze functie laat een notificatie zien
  notificationContainer.classList.remove('hidden');
  notification.innerText = message;
  setTimeout(() => notificationContainer.classList.add('hidden'), 2000);
}      

function shareLink(event){
  event.preventDefault();

  fetch(window.top.location, {method: "POST"});
  shareCount.innerText++;

  if (navigator.share) { // deze functie wordt niet door elke browser ondersteunt
    navigator.share({url: window.top.location});
  } else {
    navigator.clipboard.writeText(window.top.location);
    betterAlert('URL Gekopieërd!')
  }

  shareBtn.classList.add('done')
  setTimeout(() => shareBtn.classList.remove('done'), 2000);
}

// shareBtn.addEventListener('click', shareLink(event))
//#endregion Share