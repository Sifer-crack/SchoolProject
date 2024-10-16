// Function to test database connection
async function testDatabaseConnection() {
  try {
    console.log('Attempting to fetch from:', 'http://localhost:3000/api/users');
    const response = await fetch('http://localhost:3000/api/users');
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const users = await response.json();
    console.log('Users retrieved from database:', users);
    alert('Database connection successful! Check console for user data.');
  } catch (error) {
    console.error('Error testing database connection:', error);
    alert('Failed to connect to the database. Check console for details.');
  }
}

// Add event listener to the test button
document.addEventListener('DOMContentLoaded', function() {
  const testDatabaseButton = document.getElementById('testDatabaseButton');
  if (testDatabaseButton) {
    testDatabaseButton.addEventListener('click', testDatabaseConnection);
  }
});

/*

    Slide show

*/

let slideshows = document.querySelectorAll(".slideshow-container");

slideshows.forEach((slideshow, index) => {
  let slides = slideshow.querySelectorAll(".mySlides");
  let slideIndex = 0;

  function showSlides() {
    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {
      slideIndex = 1;
    }
    slides[slideIndex - 1].style.display = "block";
  }

  slideshow.querySelector(".prev").onclick = () => {
    slideIndex -= 2;
    if (slideIndex < 0) {
      slideIndex = slides.length - 1;
    }
    showSlides();
  };

  slideshow.querySelector(".next").onclick = () => {
    showSlides();
  };

  // Show the first slide
  showSlides();
});

/*

    Hamburger Menu

*/

document.addEventListener("DOMContentLoaded", function () {
  const hamburger = document.getElementById("hamburger-menu");
  const mobileNav = document.getElementById("mobile-nav");

  hamburger.addEventListener("click", function () {
    this.classList.toggle("active");
    mobileNav.classList.toggle("active");
  });

  // Close menu when a link is clicked
  const mobileNavLinks = mobileNav.getElementsByTagName("a");
  for (let link of mobileNavLinks) {
    link.addEventListener("click", function () {
      hamburger.classList.remove("active");
      mobileNav.classList.remove("active");
    });
  }
});

/*

    Calendar

*/

document.addEventListener("DOMContentLoaded", function () {
  const calendarBody = document.getElementById("calendar-body");
  const currentMonthElement = document.getElementById("currentMonth");
  const prevMonthButton = document.getElementById("prevMonth");
  const nextMonthButton = document.getElementById("nextMonth");

  let currentDate = new Date();

  function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    currentMonthElement.textContent = `${firstDay.toLocaleString("default", {
      month: "long",
    })} ${year}`;

    let date = 1;
    let calendarHTML = "";

    for (let i = 0; i < 6; i++) {
      let row = "<tr>";
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < startingDay) {
          row += "<td></td>";
        } else if (date > daysInMonth) {
          break;
        } else {
          const cellDate = new Date(year, month, date);
          const isToday = cellDate.toDateString() === new Date().toDateString();
          const isEvent = false; // You can implement event checking logic here
          const cellClass = isToday ? "today" : isEvent ? "event" : "";
          row += `<td class="${cellClass}">${date}</td>`;
          date++;
        }
      }
      row += "</tr>";
      calendarHTML += row;
    }

    calendarBody.innerHTML = calendarHTML;
  }

  function updateCalendar() {
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
  }

  prevMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
  });

  nextMonthButton.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
  });

  updateCalendar();
});

/*

  Authentication System

*/

const signupModal = document.getElementById("signupModal");
const loginModal = document.getElementById("loginModal");
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const authContainer = document.querySelector(".auth-container");
const authButtons = authContainer.querySelectorAll(".auth-btn");

function showModal(modal) {
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.style.display = "none";
  document.body.style.overflow = "";
}

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target == signupModal || event.target == loginModal) {
    closeModal(signupModal);
    closeModal(loginModal);
  }
};

// Handle signup
signupForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  console.log("Sign-up form submitted");
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const dateOfBirth = document.getElementById("dateOfBirth").value;
  const schoolId = document.getElementById("schoolId").value;

  console.log("Form data:", { firstName, lastName, email, password, dateOfBirth, schoolId });

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firstName, lastName, email, password, dateOfBirth, schoolId }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message);
      closeModal(signupModal);
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred during signup');
  }
});

// Handle login
loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const user = JSON.parse(getCookie('user'));
  if (user && user.email === email) {
    const hashedPassword = await hashPassword(password);
    if (hashedPassword === user.password) {
      showError("Login successful!");
      closeModal(loginModal);
      updateAuthUI(user);
    } else {
      showError("Invalid credentials");
    }
  } else {
    showError("Invalid credentials");
  }
});

// Update UI based on auth state
function updateAuthUI(user) {
  if (user) {
    authContainer.innerHTML = `
      <span>Welcome, ${user.firstName}!</span>
      <button id="logoutBtn" class="auth-btn">Log Out</button>
    `;
    document.getElementById("logoutBtn").addEventListener("click", logout);
  } else {
    authContainer.innerHTML = `
      <button class="auth-btn" id="loginBtn">Log In</button>
      <button class="auth-btn" id="signupBtn">Sign Up</button>
    `;
    document
      .getElementById("loginBtn")
      .addEventListener("click", () => showModal(loginModal));
    document
      .getElementById("signupBtn")
      .addEventListener("click", () => showModal(signupModal));
  }
}

// Add event listeners for close buttons
document.querySelectorAll('.close').forEach(closeBtn => {
  closeBtn.addEventListener('click', function() {
    closeModal(this.closest('.modal'));
  });
});

// Logout function
function logout() {
  deleteCookie('user');
  updateAuthUI(null);
}

// Initial auth check
const user = JSON.parse(getCookie('user'));
updateAuthUI(user);

// Add click event listeners to auth buttons
authButtons.forEach((button) => {
  button.addEventListener("click", function () {
    if (this.textContent === "Log In") {
      showModal(loginModal);
    } else if (this.textContent === "Sign Up") {
      showModal(signupModal);
    }
  });
});

/*

  Pop-up Contact Us Form  

*/

const button = document.getElementById("contactUsButton");
const formContainer = document.getElementById("contactFormContainer");
const contactUs = document.getElementById("contactUs");
const closeButton = document.getElementById("closeFormButton");

function openForm() {
  formContainer.classList.add("open");
  button.style.opacity = "0";
  setTimeout(() => {
    button.style.display = "none";
  }, 300);
}

function closeForm() {
  formContainer.classList.remove("open");
  button.style.display = "block";
  setTimeout(() => {
    button.style.opacity = "1";
  }, 50);
}

if (button) {
  button.addEventListener("click", openForm);
}

if (closeButton) {
  closeButton.addEventListener("click", closeForm);
}

// Close form by clicking outside
document.addEventListener("click", function (event) {
  if (
    formContainer &&
    !formContainer.contains(event.target) &&
    !button.contains(event.target)
  ) {
    closeForm();
  }
});

const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const user = JSON.parse(getCookie('user'));
  if (!user) {
    showError('Please log in to submit the form.');
    return;
  }

  const formData = {
    userId: user.id,
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: user.email,
    message: document.getElementById("message").value,
  };

  try {
    const response = await fetch("http://localhost:3000/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const result = await response.json();
      showError("Form submitted successfully! Submission ID: " + result.id);
      contactForm.reset();
      closeForm();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Form submission failed");
    }
  } catch (error) {
    console.error("Error:", error);
    showError("An error occurred while submitting the form: " + error.message);
  }
});

// Utility functions
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 3000);
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {   
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}