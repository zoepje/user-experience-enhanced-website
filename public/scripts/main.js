//#region Menu
const menuBtn = document.querySelector('.menu-button'),
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
  
// Notificatie 
function betterAlert(message) {
  notificationContainer.classList.remove('hidden'); // Haal de class hidden weg van de container
  notification.innerText = message; // Zet de text van de functie in de notificatie
  setTimeout(() => notificationContainer.classList.add('hidden'), 2000); // Na 2000ms zet de class hidden op container
}      

// Copy/share link
function shareLink(event){
  event.preventDefault(); // Zorg ervoor dat je niet de pagina herlaad

  fetch(window.top.location, {method: "POST"}); // Post naar 
  shareCount.innerText++; // tel 1 op bij shareCount

  if (navigator.share) { 
    navigator.share({url: window.top.location}); // open share opties met url van deze pagina
  } else {
    navigator.clipboard.writeText(window.top.location); // kopieer url van deze pagina naar clipboard
    betterAlert('URL Gekopieërd!') // Doe deze functie met als message "URL Gekopieërd!"
  }

  shareBtn.classList.add('done')
  setTimeout(() => shareBtn.classList.remove('done'), 2000); // Na 2000ms haal de class done van de shareBtn af
}
//#endregion Share