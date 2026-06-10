
// DarkModeToggle \\

const toggle = document.querySelector("#toggle");
const body = document.body;

const isDarkModeEnabled = localStorage.getItem("isDarkModeEnabled");

if (isDarkModeEnabled === "true") {
  body.classList.add("dark-mode");
  toggle.setAttribute("src", "Resources/Icons/Moon.svg");
}

toggle.addEventListener("click", function () {
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    toggle.setAttribute("src", "Resources/Icons/Moon.svg");
    toggle.classList.add("rotate");
    localStorage.setItem("isDarkModeEnabled", "true");
  } else {
    toggle.setAttribute("src", "Resources/Icons/Sun.svg");
    toggle.classList.remove("rotate");
    localStorage.setItem("isDarkModeEnabled", "false");
  }
});

// DarkModeToggle \\