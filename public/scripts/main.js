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
const link = encodeURI(window.location.href);
const shareBtn = document.querySelector('.deel-button');
const notification = document.querySelector('.notification');
    
function shareLink(){
  navigator.clipboard.writeText(link);
  shareBtn.classList.add('done');
  notification.classList.add('copied');
}

shareBtn.addEventListener('click', shareLink)
//#endregion Share