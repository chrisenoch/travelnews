'use strict'

// document.body.addEventListener('click', () => console.log("hello"));

const closeIcon = document.querySelector('.hamburger__close-button');
const hamburgerContainer = document.querySelector('.hamburger__container');
const hamburgerButton = document.querySelector('.hamburger__button');
console.log("print closeIcon " + closeIcon);
// closeIcon.addEventListener('click', () => alert("hello"));
closeIcon.addEventListener('click', () => {
    console.log("hello");
    hamburgerContainer.classList.add("display-none");
});

hamburgerButton.addEventListener('click', () => {
    console.log("hello");
    hamburgerContainer.classList.remove("display-none");
});

