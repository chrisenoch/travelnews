'use strict'

const closeIcon = document.querySelector('.hamburger__close-button');
const hamburgerContainer = document.querySelector('.hamburger__container');
const hamburgerButton = document.querySelector('.hamburger__button');

closeIcon.addEventListener('click', () => {
    hamburgerContainer.classList.add("display-none");
});

hamburgerButton.addEventListener('click', () => {
    hamburgerContainer.classList.remove("display-none");
});

