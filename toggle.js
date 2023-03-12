
// DarkModeToggle \\

const toggle = document.querySelector("#toggle");
const body = document.body;
const darkdivs = document.querySelectorAll('.dark');



// Check if dark mode is enabled in local storage
const isDarkModeEnabled = localStorage.getItem("isDarkModeEnabled");

if (isDarkModeEnabled) {
  body.classList.add("dark-mode");
  toggle.setAttribute("src", "Resources/Icons/Moon.svg");
  body.style.backgroundImage = "url('Resources/BG-Dark.jpg')";
  darkdivs.forEach(darkdiv => {
    darkdiv.style.filter = 'grayscale(100%) invert(100%) brightness(100%)';
  });
}

toggle.addEventListener("click", function () {
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    toggle.setAttribute("src", "Resources/Icons/Moon.svg");
    toggle.classList.add("rotate");
    body.style.backgroundImage = "url('Resources/BG-Dark.jpg')";
    darkdivs.forEach(darkdiv => {
      darkdiv.style.filter = 'grayscale(100%) invert(100%) brightness(100%)';
    });

    // Store dark mode state in local storage
    localStorage.setItem("isDarkModeEnabled", true);
  } else {
    toggle.setAttribute("src", "Resources/Icons/Sun.svg");
    toggle.classList.remove("rotate");
    body.style.backgroundImage = "url('Resources/BG-Light.jpg')";
    darkdivs.forEach(darkdiv => {
      darkdiv.style.filter = '';
    });
    // Remove dark mode state from local storage
    localStorage.removeItem("isDarkModeEnabled");
  }
});

// DarkModeToggle \\