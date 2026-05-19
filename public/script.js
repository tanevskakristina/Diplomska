document.addEventListener("DOMContentLoaded", function () {

    console.log("SCRIPT LOADED");

    updateUI();
    initMembers();
    initTrainersCount();
    initExperienceCount();
    loadTrainers();
    initChatWidget();
    initScrollAnimations();

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

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMembership();
            closeTrainer();
            closeLogin();
            closeProfilePicture();
        }
    });

    
});

// Attach membership card click handlers after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.price-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            console.log('price-card clicked:', card.className);
            // prefer explicit class names: vip, premium, basic
            let type = 'Basic';
            if (card.classList.contains('vip')) type = 'VIP';
            else if (card.classList.contains('premium')) type = 'Premium';
            openMembership(type);
        });
    });
});

// expose for manual testing from console
window.openMembership = openMembership;


// ================= MEMBERS =================
function initMembers() {
    fetch('/api/users/members/count')
    .then(res => res.json())
    .then(data => {
        document.getElementById("membersCount").innerText = data.count || 0;
    })
    .catch(err => {
        console.error('Error fetching member count:', err);
        document.getElementById("membersCount").innerText = "0";
    });
}

function refreshMembers() {
    initMembers();
}


// ================= TRAINERS COUNT =================
function initTrainersCount() {
    fetch('/api/trainers/count/total')
    .then(res => res.json())
    .then(data => {
        document.getElementById("trainersCount").innerText = data.count || 0;
    })
    .catch(err => {
        console.error('Error fetching trainers count:', err);
        document.getElementById("trainersCount").innerText = "0";
    });
}


// ================= EXPERIENCE COUNT =================
function initExperienceCount() {
    fetch('/api/trainers/experience/total')
    .then(res => res.json())
    .then(data => {
        document.getElementById("experienceCount").innerText = data.totalExperience || 0;
    })
    .catch(err => {
        console.error('Error fetching experience count:', err);
        document.getElementById("experienceCount").innerText = "0";
    });
}


// ================= TRAINERS =================
function loadTrainers() {
    fetch('/api/trainers')
    .then(res => res.json())
    .then(data => {
        const container = document.querySelector(".trainer-container");
        if (!container) return;

        container.innerHTML = "";

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #aaa;">Сè уште нема додадено тренери.</p>';
            return;
        }

        // Show only first 3 trainers
        const trainersToShow = data.slice(0, 3);

        trainersToShow.forEach(trainer => {
            const div = document.createElement("div");
            div.classList.add("trainer-card");
            div.innerHTML = `
                <img src="${trainer.photo}" alt="${trainer.name}">
                <h3>${trainer.name} ${trainer.surname}</h3>
                <p>${trainer.specialty || 'Фитнес тренер'}</p>
            `;
            container.appendChild(div);
        });

        // If more than 3 trainers, add view all link
        if (data.length > 3) {
            const viewAllDiv = document.createElement("div");
            viewAllDiv.style.gridColumn = "1 / -1";
            viewAllDiv.style.textAlign = "center";
            viewAllDiv.style.padding = "20px";
            viewAllDiv.innerHTML = `
                <a href="all-trainers.html" style="
                    display: inline-block;
                    background: #ffd6c8;
                    color: #000;
                    padding: 12px 30px;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: bold;
                    transition: background 0.3s ease;
                ">Видете сите ${data.length} тренери</a>
            `;
            container.appendChild(viewAllDiv);
        }
    })
    .catch(err => {
        console.error('Error loading trainers:', err);
        const container = document.querySelector(".trainer-container");
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Грешка при вчитување на тренери</p>';
        }
    });
}
function addTestimonial() {

    const name = document.getElementById("userName").value;
    const message = document.getElementById("userMessage").value;
    const ratingEl = document.getElementById("userRating");
    const rating = ratingEl ? ratingEl.value : null;

    if (!name || !message || !rating) return alert("Пополнете го името, пораката и оцената!");

    fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, rating })
    })
    .then(res => res.json())
    .then(data => {
        if (data.testimonial) {
            document.getElementById("userName").value = "";
            document.getElementById("userMessage").value = "";
            if (ratingEl) ratingEl.value = "5";
            // Do not load testimonials here (index should not display them)
            alert('Успешно пратено! Благодарам.');
        } else {
            alert(data.message || 'Грешка при праќање');
        }
    })
    .catch(err => {
        console.error('Error saving testimonial:', err);
        alert('Грешка при праќање');
    });
}

function loadTestimonials() {
    const container = document.querySelector(".testimonial-container");
    if (!container) return;
    container.innerHTML = "<p>Вчитување...</p>";

    fetch('/api/testimonials')
    .then(res => res.json())
    .then(data => {
        container.innerHTML = "";
        if (!data || data.length === 0) {
            container.innerHTML = "<p>Сè уште нема мислења.</p>";
            return;
        }

        data.forEach(t => {
            const div = document.createElement("div");
            div.classList.add("testimonial-card");
            const stars = '★'.repeat(t.rating || 0) + '☆'.repeat(5 - (t.rating || 0));
            div.innerHTML = `<div class="testimonial-rating">${stars}</div><p>"${t.message}"</p><h4>- ${t.name}</h4>`;
            container.appendChild(div);
        });
    })
    .catch(err => {
        console.error('Error loading testimonials', err);
        container.innerHTML = "<p>Грешка при вчитување.</p>";
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
            refreshMembers();
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

function logoutUser() {
    localStorage.removeItem("loggedUser");
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userProfilePicture");
    updateUI();
}

function updateUI() {

    let user = JSON.parse(localStorage.getItem("loggedUser"));
    let adminToken = localStorage.getItem("adminToken");

    let welcome = document.getElementById("welcomeUser");
    let loginBtn = document.getElementById("loginBtn");
    let logoutBtn = document.getElementById("logoutBtn");
    let registerBtn = document.getElementById("registerBtn");
    let userAvatar = document.getElementById("userAvatar");

    if (user || adminToken) {
        if (user) {
            welcome.innerText = "Добредојде, " + user.name;
        } else {
            welcome.innerText = "Добредојде админ";
        }
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        if (registerBtn) registerBtn.style.display = "none";
        if (userAvatar) userAvatar.style.display = "flex";
        // Display avatar with picture or initials
        displayUserAvatar();

        // Show admin link if admin is logged in
        if (adminToken) {
            let adminLink = document.getElementById("adminLink");
            if (!adminLink) {
                adminLink = document.createElement("a");
                adminLink.id = "adminLink";
                adminLink.href = "admin-trainers.html";
                adminLink.style.color = "#ffd6c8";
                adminLink.style.marginRight = "15px";
                adminLink.style.textDecoration = "none";
                adminLink.style.fontWeight = "bold";
                adminLink.innerText = "Администратор";
                welcome.parentElement.insertBefore(adminLink, welcome.nextSibling);
            }
            adminLink.style.display = "inline-block";
        }
    } else {
        welcome.innerText = "";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "block";
        if (userAvatar) userAvatar.style.display = "none";

        // Hide admin link if not admin
        let adminLink = document.getElementById("adminLink");
        if (adminLink) adminLink.style.display = "none";
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
    const modal = document.getElementById("trainerModal");
    if (modal) modal.style.display = "none";
}

// ================= MEMBERSHIP MODAL =================
function openMembership(type) {
    const titleEl = document.getElementById('membershipTitle');
    const priceEl = document.getElementById('membershipPrice');
    const benefitsEl = document.getElementById('membershipBenefits');

    let data = { price: '', benefits: [] };

    if (type === 'Basic') {
        data.price = '1000 ден';
        data.benefits = [
            'Неограничен пристап до фитнес зоната',
            'Современа кардио и strength опрема',
            'Комфорни соблекувални и туш кабини',
            'Почетен фитнес план според твоите цели',
            'Енергија, мотивација и атмосфера на високо ниво'
        ];
    } else if (type === 'Premium') {
        data.price = '1500 ден';
        data.benefits = [
            'Сè од BASIC пакетот',
            '24/7 пристап без ограничување',
            'Групни часови: HIIT, Functional, Yoga, Pilates',
            'Персонализирана програма за тренинг и исхрана',
            'Приоритетни резервации за часови',
            'Exclusive discounts на суплементи и fitness bar',
            'Следење на прогрес и body analysis'
        ];
    } else if (type === 'VIP') {
        data.price = '2500 ден';
        data.benefits = [
            'Целосно PREMIUM искуство',
            'Dedicated personal trainer',
            'VIP locker & private зона',
            'Priority access до цела опрема и студија',
            'Бесплатни premium protein shakes & coffee',
            'Месечни body composition анализи',
            'Private coaching & lifestyle support',
            'Бесплатен паркинг',
            'Exclusive VIP events и специјални привилегии'
        ];
    }

    if (titleEl) {
        const titleMap = { Basic: 'BASIC MEMBERSHIP', Premium: 'PREMIUM MEMBERSHIP', VIP: 'VIP MEMBERSHIP' };
        titleEl.innerText = titleMap[type] || type;
    }

    if (priceEl) priceEl.innerText = data.price;
    if (benefitsEl) benefitsEl.innerHTML = data.benefits.map(b => `<li>${b}</li>`).join('');

    const modal = document.getElementById('membershipModal');
    if (modal) modal.style.display = 'flex';
}

function closeMembership() {
    const modal = document.getElementById('membershipModal');
    if (modal) modal.style.display = 'none';
}

const submitJoinEl = document.getElementById("submitJoin");
if (submitJoinEl) {
    submitJoinEl.addEventListener("click", async () => {

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

        const msgEl = document.getElementById("message");
        if (msgEl) msgEl.innerText = data.message;
    });
}

// ================= PROFILE PICTURE MODAL =================
function openProfilePicture() {
    const modal = document.getElementById('profilePictureModal');
    if (modal) modal.style.display = 'flex';
}

function closeProfilePicture() {
    const modal = document.getElementById('profilePictureModal');
    if (modal) modal.style.display = 'none';
    // Reset file input
    const fileInput = document.getElementById('profileImageInput');
    if (fileInput) fileInput.value = '';
}

// Handle file selection and preview
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('profileImageInput');
    const preview = document.getElementById('imagePreview');
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
});

// Upload and save profile picture
function uploadProfilePicture() {
    const fileInput = document.getElementById('profileImageInput');
    if (!fileInput || !fileInput.files[0]) {
        alert('Одбери слика!');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const imageData = e.target.result;
        
        // Get current user
        let user = JSON.parse(localStorage.getItem('loggedUser'));
        if (user) {
            // Save image to localStorage
            localStorage.setItem('userProfilePicture', imageData);
            
            // Update avatar display
            displayUserAvatar();
            
            // Close modal
            closeProfilePicture();
            
            alert('Твоја слика е зачувана!');
        }
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// Display user avatar with profile picture or initials
function displayUserAvatar() {
    const userAvatar = document.getElementById('userAvatar');
    const avatarInitials = document.getElementById('avatarInitials');
    const profilePicture = localStorage.getItem('userProfilePicture');
    
    if (userAvatar) {
        if (profilePicture) {
            userAvatar.innerHTML = `<img src="${profilePicture}" alt="Profile">`;
        } else {
            let user = JSON.parse(localStorage.getItem('loggedUser'));
            if (user) {
                const names = user.name.split(" ");
                const initials = names.map(n => n[0]).join("").toUpperCase().slice(0, 2);
                userAvatar.innerHTML = `<span id="avatarInitials">${initials}</span>`;
            } else {
                userAvatar.innerHTML = '<span id="avatarInitials">A</span>';
            }
        }
    }
}

// Add click handler to avatar to open profile picture modal
document.addEventListener('DOMContentLoaded', () => {
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', openProfilePicture);
    }
});

function initChatWidget() {
    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatSend = document.getElementById('chatSend');
    const chatInput = document.getElementById('chatInput');
    const messageContainer = document.getElementById('chatMessages');
    const suggestions = Array.from(document.querySelectorAll('.chat-suggestion'));

    if (!chatToggle || !chatWindow || !chatClose || !chatSend || !chatInput || !messageContainer) {
        return;
    }

    function resetChatDialog() {
        messageContainer.innerHTML = '';
        addChatMessage('Здраво! Можам да помогнам со прашања за фитнес, членарини и тренери.', 'bot');
        chatInput.value = '';
    }

    function setChatVisible(show) {
        const wasOpen = chatWindow.classList.contains('show');
        chatWindow.classList.toggle('show', show);
        chatWindow.setAttribute('aria-hidden', !show);
        if (show) {
            if (!wasOpen) {
                resetChatDialog();
            }
            chatInput.focus();
        }
    }

    function addChatMessage(text, sender) {
        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${sender}`;
        messageEl.innerText = text;
        messageContainer.appendChild(messageEl);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    function getChatbotResponse(input) {
        const normalized = input.trim().toLowerCase();

        if (normalized.includes('кое е работното време') || normalized.includes('работно време')) {
            return 'Понеделник - Петок: 06:00 - 00:00.\nСабота: 08:00 - 22:00.\nНедела: 09:00 - 22:00.';
        }
        if (normalized.includes('колку е месечна чланарина') || normalized.includes('чланарина')) {
            return 'VIP: 2500 ден.\nPremium: 1500 ден.\nBasic: 1000 ден.';
        }
        if (normalized.includes('Колку години постои теретаната') || normalized.includes('колку години')) {
            return 'Нашата теретана постои од 2010 година, со повеќе од 14 години искуство во фитнес индустријата.';
        }
        if (normalized.includes('Кој тренер има најмногу искуство') || normalized.includes('најискусен тренер')) {
            return 'Нашиот најискусен тренер е Милена Костовска, со над 20 години искуство во фитнес тренинг и персонален тренинг.';
        }
        if (/плати|пари/.test(normalized)) {
            return 'Основниот пакет е 1000 ден, Premium е 1500 ден, а VIP е 2500 ден.';
        }
        if (/отворено|open|час/.test(normalized)) {
            return 'Работното време е од 08:00 до 22:00 во работните денови и од 09:00 до 17:00 во сабота.';
        }
        if (/продавниц|shop|купување/.test(normalized)) {
            return 'Погледни ја нашата продавница преку линкот "Продавница" во навигацијата.';
        }
        if (/bmi|калкулатор|тежина|висина/.test(normalized)) {
            return 'За BMI користи го калкулаторот на страницата со висина во cm и тежина во kg.';
        }

        return 'Се извинувам, не можам точно да одговорам, но можам да ти помогнам со прашања за фитнес, членарини и тренери.';
    }

    function sendChatMessage(text) {
        if (!text) return;

        addChatMessage(text, 'user');
        chatInput.value = '';

        setTimeout(() => {
            addChatMessage(getChatbotResponse(text), 'bot');
        }, 400);
    }

    function sendChatMessageFromButton(question) {
        const text = question.trim();
        if (!text) return;
        addChatMessage(text, 'user');
        setTimeout(() => {
            addChatMessage(getChatbotResponse(text), 'bot');
        }, 400);
    }

    suggestions.forEach(button => {
        button.addEventListener('click', () => {
            sendChatMessageFromButton(button.dataset.question || button.innerText);
        });
    });

    chatToggle.addEventListener('click', () => setChatVisible(!chatWindow.classList.contains('show')));
    chatClose.addEventListener('click', () => setChatVisible(false));
    chatSend.addEventListener('click', () => sendChatMessage(chatInput.value.trim()));
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendChatMessage(chatInput.value.trim());
        }
    });
}

// ================= SCROLL ANIMATIONS =================
function initScrollAnimations() {
    const selector = 'section, .trainer-card, .price-card, .testimonial-card, .product-card, .stat, .hero-content';
    const targets = Array.from(document.querySelectorAll(selector));

    function getAnimationFor(el) {
        if (el.classList.contains('trainer-card')) return 'animate-slide-left';
        if (el.classList.contains('price-card')) return 'animate-zoom';
        if (el.classList.contains('testimonial-card')) return 'animate-slide-right';
        if (el.classList.contains('product-card')) return 'animate-zoom';
        if (el.classList.contains('stat')) return 'animate-fade';
        if (el.classList.contains('hero-content')) return 'animate-zoom-slow';
        return 'animate-fade';
    }

    // Add hidden + animation class initially and prepare stagger delay
    targets.forEach((el, i) => {
        const anim = getAnimationFor(el);
        el.classList.add(anim);
        if (!el.classList.contains('hidden') && !el.classList.contains('show')) {
            el.classList.add('hidden');
        }
        // stagger delay per element
        el.dataset.animDelay = (i * 0.06).toFixed(2);
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.12
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.animDelay || 0;
                entry.target.style.transitionDelay = `${delay}s`;
                entry.target.classList.add('show');
                entry.target.classList.remove('hidden');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    targets.forEach(t => observer.observe(t));
}
