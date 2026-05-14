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
    const surname = document.getElementById("regSurname").value;
    const age = document.getElementById("regAge").value;
    const address = document.getElementById("regAddress").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const parking = document.querySelector('input[name="parking"]:checked')?.value;
    const gymTime = document.querySelector('input[name="gymTime"]:checked')?.value;

    if (!name || !surname || !age || !address || !email || !password || !parking || !gymTime) {
        document.getElementById("authMessage").innerText = "Пополнете ги сите полиња!";
        return;
    }

    const userData = {
        name,
        surname,
        age: parseInt(age),
        address,
        email,
        password,
        parking,
        gymTime
    };

    fetch('/api/users/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "User registered successfully") {
            document.getElementById("authMessage").innerText = "Успешна регистрација!";
            // Clear form
            document.getElementById("regName").value = "";
            document.getElementById("regSurname").value = "";
            document.getElementById("regAge").value = "";
            document.getElementById("regAddress").value = "";
            document.getElementById("regEmail").value = "";
            document.getElementById("regPassword").value = "";
            document.querySelectorAll('input[name="parking"]').forEach(radio => radio.checked = false);
            document.querySelectorAll('input[name="gymTime"]').forEach(radio => radio.checked = false);
        } else {
            document.getElementById("authMessage").innerText = data.message;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById("authMessage").innerText = "Грешка при регистрација!";
    });
}

function loginUser() {

    let email = document.getElementById("loginEmail").value;
    let password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        document.getElementById("loginMessage").innerText = "Пополнете ги полињата!";
        return;
    }

    fetch('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {

        if (data.token) {

            // REMOVE old tokens first
            localStorage.removeItem("token");
            localStorage.removeItem("adminToken");

            // Save logged user
            localStorage.setItem("loggedUser", JSON.stringify(data.user));

            // ADMIN LOGIN
            if (data.user && data.user.role === "admin") {

                localStorage.setItem("adminToken", data.token);

            } else {

                // NORMAL USER LOGIN
                localStorage.setItem("token", data.token);
            }

            document.getElementById("loginMessage").innerText =
                "Успешен login!";

            closeLogin();
            updateUI();

        } else {

            document.getElementById("loginMessage").innerText =
                data.message;
        }
    })
    .catch(error => {

        console.error('Error:', error);

        document.getElementById("loginMessage").innerText =
            "Грешка при login!";
    });
}

    message.innerText = "Добредојде " + user.name;

    updateUI();

    setTimeout(() => {
        closeLogin();
    }, 1000);


function logoutUser() {
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    updateUI();
}

function updateUI() {

    let user = JSON.parse(localStorage.getItem("loggedUser"));
    let adminToken = localStorage.getItem("adminToken");

    let welcome = document.getElementById("welcomeUser");
    let loginBtn = document.getElementById("loginBtn");
    let logoutBtn = document.getElementById("logoutBtn");
    let registerBtn = document.getElementById("registerBtn");

    if (user || adminToken) {
        if (user) {
            welcome.innerText = "Добредојде, " + user.name;
        } else {
            welcome.innerText = "Добредојде админ";
        }
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        if (registerBtn) registerBtn.style.display = "none";
    } else {
        welcome.innerText = "";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "block";
    }
}


// ================= BMI =================
function calculateBMI() {

    let h = document.getElementById("height").value;
    let w = document.getElementById("weight").value;

    if (!h || !w) return;

    h = h / 100;

    let bmi = w / (h * h);
   { 
    document.getElementById("bmiResult").innerText =
        "BMI: " + bmi.toFixed(2);

    if (bmi < 18.5) {
        document.getElementById("bmiCategory").innerText = "Подпросечна тежина";
    } else if (bmi < 25) {
        document.getElementById("bmiCategory").innerText = "Нормална тежина";
    } else if (bmi < 30) {
        document.getElementById("bmiCategory").innerText = "Надпросечна тежина";
    } else {
        document.getElementById("bmiCategory").innerText = "Обесност";
    }
}
}

function openTrainer(name, type, bio, image) {

    document.getElementById("trainerName").innerText = name;

    document.getElementById("trainerType").innerText = type;

    document.getElementById("trainerBio").innerText = bio;

    document.getElementById("trainerImg").src = image;

    document.getElementById("trainerModal").style.display = "flex";
}

function closeTrainer() {

    document.getElementById("trainerModal").style.display = "none";
}

document.getElementById("submitJoin").addEventListener("click", async () => {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            email
        })
    });

    const data = await response.json();

    document.getElementById("message").innerText =
        data.message;
});