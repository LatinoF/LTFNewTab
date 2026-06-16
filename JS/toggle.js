
// DarkModeToggle \\

const toggle = document.querySelector("#toggle");
const body = document.body;

const isDarkModeEnabled = localStorage.getItem("isDarkModeEnabled");

if (isDarkModeEnabled === "true") {
  body.classList.add("dark-mode");
  toggle.innerHTML = SVG_MOON;
} else {
  toggle.innerHTML = SVG_SUN;
}

toggle.addEventListener("click", function () {
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    toggle.innerHTML = SVG_MOON;
    toggle.classList.add("rotate");
    localStorage.setItem("isDarkModeEnabled", "true");
  } else {
    toggle.innerHTML = SVG_SUN;
    toggle.classList.remove("rotate");
    localStorage.setItem("isDarkModeEnabled", "false");
  }
});

// DarkModeToggle \\