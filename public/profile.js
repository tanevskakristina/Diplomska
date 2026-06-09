const user = JSON.parse(localStorage.getItem("loggedUser"));

if (!user) {
    window.location.href = "index.html";
}

let currentProfile = null;

async function loadProfile() {

        
    try {

        const response = await fetch(
            `/api/users/profile/${user._id}`
        );
        
        currentProfile = await response.json();

        
    if (
    currentProfile.profilePicture &&
    document.getElementById("profileImage")
    ) {
    document.getElementById("profileImage").src =
        currentProfile.profilePicture;
    }

        document.getElementById("name").textContent =
            currentProfile.name;

        document.getElementById("surname").textContent =
            currentProfile.surname;

        document.getElementById("email").textContent =
            currentProfile.email;

        document.getElementById("age").textContent =
            currentProfile.age;

        document.getElementById("address").textContent =
            currentProfile.address;

        document.getElementById("pricingPlan").textContent =
            currentProfile.pricingPlan;

        document.getElementById("trainer").textContent =
            currentProfile.personalTrainer
                ? `${currentProfile.personalTrainer.name} ${currentProfile.personalTrainer.surname}`
                : "Нема тренер";

        document.getElementById("appointment").textContent =
            currentProfile.trainerAppointment || "Нема термин";

        document.getElementById("planSelect").value =
            currentProfile.pricingPlan;

        await loadTrainerDropdown();

    } catch (error) {
        console.error(error);
    }
    
}

async function loadTrainerDropdown() {

    const response =
        await fetch("/api/trainers");

    const trainers =
        await response.json();

    const select =
        document.getElementById("trainerSelectProfile");

    select.innerHTML =
        '<option value="">Нема тренер</option>';

    trainers.forEach(trainer => {

        const option =
            document.createElement("option");

        option.value = trainer._id;

        option.textContent =
            `${trainer.name} ${trainer.surname}`;

        select.appendChild(option);
    });

    if (currentProfile.personalTrainer) {

        select.value =
            currentProfile.personalTrainer._id;
    }

    await loadAppointments();
}

async function loadAppointments() {

    const trainerId =
        document.getElementById("trainerSelectProfile").value;

    const appointmentSelect =
        document.getElementById("appointmentSelectProfile");

    appointmentSelect.innerHTML = "";

    if (!trainerId) {

        appointmentSelect.innerHTML =
            '<option value="">No Appointment</option>';

        return;
    }

    const response =
        await fetch(`/api/trainers/${trainerId}`);

    const trainer =
        await response.json();

    const appointments =
        trainer.availableAppointments
            .split(",")
            .map(a => a.trim())
            .filter(Boolean);

    appointments.forEach(time => {

        const option =
            document.createElement("option");

        option.value = time;
        option.textContent = time;

        appointmentSelect.appendChild(option);
    });

    if (currentProfile.trainerAppointment) {

        appointmentSelect.value =
            currentProfile.trainerAppointment;
    }
}

async function saveChanges() {

    const pricingPlan =
        document.getElementById("planSelect").value;

    const personalTrainer =
        document.getElementById("trainerSelectProfile").value;

    const trainerAppointment =
        document.getElementById("appointmentSelectProfile").value;

    const response = await fetch(
        `/api/users/update/${user._id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pricingPlan,
                personalTrainer: personalTrainer || null,
                trainerAppointment: trainerAppointment || null
            })
        }
    );

    const data = await response.json();

    if (data.user) {

        alert("Промените се зачувани");

        await loadProfile();
    }
}

async function uploadProfilePicture() {
    const file = document.getElementById("profilePictureInput").files[0];

    if (!file) {
        alert("Изберете слика");
        return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
        const base64Image = reader.result;

        const response = await fetch("/api/users/upload-picture", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user._id,
                profilePicture: base64Image
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById("profileImage").src = base64Image;
            alert("Сликата е ажурирана");
        } else {
            alert(data.message);
        }
    };

    reader.readAsDataURL(file);
}

document
    .getElementById("uploadPictureBtn")
    ?.addEventListener("click", uploadProfilePicture);

document
    .getElementById("trainerSelectProfile")
    .addEventListener("change", loadAppointments);

document
    .getElementById("saveChangesBtn")
    .addEventListener("click", saveChanges);

document
    .getElementById("cancelMembershipBtn")
    .addEventListener("click", async () => {

        if (!confirm("Дали сте сигурни?"))
            return;

        await fetch(
            `/api/users/cancel-membership/${user._id}`,
            {
                method: "PUT"
            }
        );

        await loadProfile();
    });

    

loadProfile();