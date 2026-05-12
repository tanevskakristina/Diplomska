document.addEventListener("DOMContentLoaded", function () {

    console.log("SCRIPT LOADED");

    updateUI();
    initMembers();

    // ================= TOP BUTTON =================
    const topBtn = document.getElementById("topBtn");

    if (topBtn) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 150) {
                topBtn.style.display = "block";
            } else {
                topBtn.style.display = "none";
            }
        });

        topBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ================= JOIN MODAL =================
    const joinBtn = document.getElementById("joinBtn");
    const modal = document.getElementById("joinModal");
    const closeBtn = document.querySelector("#joinModal .close");

    if (joinBtn && modal) {
        joinBtn.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // ================= JOIN SUBMIT =================
    const submitBtn = document.getElementById("submitJoin");

    if (submitBtn) {
        submitBtn.addEventListener("click", function () {

            let name = document.getElementById("name").value;
            let email = document.getElementById("email").value;

            if (!name || !email) {
                alert("Пополнете ги полињата!");
                return;
            }

            increaseMembers();

            document.getElementById("message").innerText =
                "Успешно се зачлени! 🎉";
        });
    }
});


// ================= MEMBERS =================
function initMembers() {

    let members = localStorage.getItem("membersCount");

    if (!members) {
        members = 1200;
        localStorage.setItem("membersCount", members);
    }

    document.getElementById("membersCount").innerText = members;
}

function increaseMembers() {

    let members = localStorage.getItem("membersCount");

    if (!members) members = 1200;

    members = parseInt(members) + 1;

    localStorage.setItem("membersCount", members);

    document.getElementById("membersCount").innerText = members;
}


// ================= TESTIMONIALS =================
function addTestimonial() {

    let name = document.getElementById("userName").value;
    let message = document.getElementById("userMessage").value;

    if (!name || !message) return alert("Пополнете!");

    let testimonials = JSON.parse(localStorage.getItem("testimonials")) || [];

    testimonials.push({ name, message });

    localStorage.setItem("testimonials", JSON.stringify(testimonials));

    document.getElementById("userName").value = "";
    document.getElementById("userMessage").value = "";

    loadTestimonials();
}

function loadTestimonials() {

    let container = document.querySelector(".testimonial-container");

    if (!container) return;

    container.innerHTML = "";

    let testimonials = JSON.parse(localStorage.getItem("testimonials")) || [];

    testimonials.forEach(t => {

        let div = document.createElement("div");
        div.classList.add("testimonial-card");

        div.innerHTML = `<p>"${t.message}"</p><h4>- ${t.name}</h4>`;

        container.appendChild(div);
    });
}


// ================= TRAINER FILTER =================
function filterTrainers(type) {

    document.querySelectorAll(".trainer-card").forEach(card => {

        if (type === "all" || card.dataset.type === type) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}


// ================= LOGIN / REGISTER =================
function openLogin() {
    document.getElementById("loginModalBox").style.display = "flex";
}

function closeLogin() {
    document.getElementById("loginModalBox").style.display = "none";
}

function registerUser() {

    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        document.getElementById("authMessage").innerText = "Пополнете!";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    users.push({ name, email, password });

    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("authMessage").innerText =
        "Успешна регистрација!";
}

function loginUser() {

    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    let user = users.find(u => u.email === email && u.password === password);

    let message = document.getElementById("loginMessage");

    if (!user) {
        message.innerText = "Грешни податоци!";
        return;
    }

    localStorage.setItem("loggedUser", JSON.stringify(user));

    message.innerText = "Добредојде " + user.name;

    updateUI();

    setTimeout(() => {
        closeLogin();
    }, 1000);
}

function logoutUser() {
    localStorage.removeItem("loggedUser");
    updateUI();
}

function updateUI() {

    let user = JSON.parse(localStorage.getItem("loggedUser"));

    let welcome = document.getElementById("welcomeUser");
    let loginBtn = document.getElementById("loginBtn");
    let logoutBtn = document.getElementById("logoutBtn");

    if (user) {
        welcome.innerText = "Добредојде, " + user.name;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
    } else {
        welcome.innerText = "";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
    }
}


// ================= BMI =================
function calculateBMI() {

    let h = document.getElementById("height").value;
    let w = document.getElementById("weight").value;

    if (!h || !w) return;

    h = h / 100;

    let bmi = w / (h * h);

    document.getElementById("bmiResult").innerText =
        "BMI: " + bmi.toFixed(2);
}