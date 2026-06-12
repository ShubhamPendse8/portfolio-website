// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

// Get stored theme OR default to 'dark'
let currentTheme = localStorage.getItem("theme") || "dark";

// Apply initial theme
if (currentTheme === "dark") {
  body.classList.add("dark");
  themeToggle.textContent = "☀️"; // sun icon
} else {
  body.classList.remove("dark");
  themeToggle.textContent = "🌙"; // moon icon
}

// Toggle theme on button click
themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  const isDark = body.classList.contains("dark");

  // Update icon
  themeToggle.textContent = isDark ? "☀️" : "🌙";

  // Save preference
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Carousel scroll function
function scrollCarousel(id, direction = 1) {
  const carousel = document.getElementById(id);
  const scrollAmount = 380 * direction; // 360px + gap
  carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}


