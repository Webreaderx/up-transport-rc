const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");
const password1 = document.getElementById("password1");
const confirmPassword1 = document.getElementById("confirmPassword1");
const submitBtn1 = document.getElementById("submitBtn1");
const message1 = document.getElementById("message1");
const agree = document.getElementById("agree");
const agree1 = document.getElementById("agree1");




function checkPassword() {

    if (password.value === "" || confirmPassword.value === "") {

        submitBtn.disabled = true;
        message.innerText = "";
        submitBtn.classList.remove("bg-blue-700");
        submitBtn.classList.add("bg-blue-300");
        return;
    }

    if (password.value === confirmPassword.value) {

        message.innerText = "✓ Password Matched";
        message.style.color = "green";

    } else {

        message.innerText = "✗ Password Not Matched";
        message.style.color = "red";

    }

    // Sirf yahi decide karega button enable hoga ya nahi
    if (password.value === confirmPassword.value && agree.checked) {

        submitBtn.disabled = false;
        submitBtn.classList.remove("bg-blue-300");
        submitBtn.classList.add("bg-blue-700");

    } else {

        submitBtn.disabled = true;
        submitBtn.classList.remove("bg-blue-700");
        submitBtn.classList.add("bg-blue-300");

    }

}



function checkPassword1() {

    if (password1.value === "" || confirmPassword1.value === "") {

        submitBtn1.disabled = true;
        message1.innerText = "";
        submitBtn1.classList.remove("bg-blue-700");
        submitBtn1.classList.add("bg-blue-300");
        return;
    }

    if (password1.value === confirmPassword1.value) {

        message1.innerText = "✓ Password Matched";
        message1.style.color = "green";

    } else {

        message1.innerText = "✗ Password Not Matched";
        message1.style.color = "red";

    }

    // Sirf yahi decide karega button enable hoga ya nahi
    if (password1.value === confirmPassword1.value && agree1.checked) {

        submitBtn1.disabled = false;
        submitBtn1.classList.remove("bg-blue-300");
        submitBtn1.classList.add("bg-blue-700");

    } else {

        submitBtn1.disabled = true;
        submitBtn1.classList.remove("bg-blue-700");
        submitBtn1.classList.add("bg-blue-300");

    }

}



password.addEventListener("input", checkPassword);
confirmPassword.addEventListener("input", checkPassword);
password1.addEventListener("input", checkPassword1);
confirmPassword1.addEventListener("input", checkPassword1);
agree.addEventListener("change", checkPassword);
agree1.addEventListener("change", checkPassword1);



