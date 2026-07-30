const axios = require("axios");

async function sendEmail({ to, subject, text }) {
    try {

        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "UP Transport Department",
                    email: process.env.EMAIL
                },

                to: [
                    {
                        email: to
                    }
                ],

                subject: subject,

                textContent: text

            },
            {
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (err) {
    console.error("========== EMAIL ERROR ==========");

    if (err.response) {
        console.error(err.response.data);
    } else {
        console.error(err.message);
    }

    throw err;
}
}

module.exports = sendEmail;