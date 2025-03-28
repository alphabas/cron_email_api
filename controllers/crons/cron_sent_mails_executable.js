const express = require("express");
const { Op } = require("sequelize");
const fs = require("node:fs");
const path = require("path");
const moment = require("moment");
const AUTH_LOGIN = require("../../constants/AUTH_LOGIN");
const Users = require("../../models/users/Users");
const emailSenderService = require("../../services/emailSenderService");
const { createLogErrorMail } = require("../log_email_sent/log_email_sent.controller");
const Validation = require("../../class/Validation");
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS");

const CRON_SENT_EMAIL_EXECUTABLE = () => {

    var delayInMilliseconds = 30000;
    var interval = setInterval(() => {
        clearInterval(interval);
        cron_emails();
    }, delayInMilliseconds);
};


// *******AUTH AND SEND EMAILS ***********


async function authentificationEmailAdmin() {
    const username = AUTH_LOGIN.USERNAME;
    const password = AUTH_LOGIN.PASSWORD;

    const data = {
        username: username,
        password: password,
    };
    const url = `${AUTH_LOGIN.URI_SENDER}`;
    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
        });
        const responseData = await response.json();
        // console.log(responseData);
        return responseData;
    } catch (error) {
        console.log("ERROR ATHENTIFICATION.... :", error);
        // console.error(error);
        throw error;
    }
}



async function currentUsers() {
    try {
        const responseData = await Users.findAll();
        return responseData;
    } catch (error) {
        console.log("ERROR TO GET USERS.... :", error);
        throw error;
    }
}



const cron_emails = async (res, req) => {
    try {
        console.log("+++++++START CRONS++++++++");
        const userData = await currentUsers();
        if (userData && userData.length > 0) {
            // Définition des quantités d'emails à envoyer à chaque étape
            const emailCounts = [5, 10, 20]; // Messageries par utilisateur à chaque étape
            const timeIntervals = [1 * 60 * 1000, 3 * 60 * 1000, 6 * 60 * 1000]; // 5 minutes, 10 minutes
            const totalSteps = emailCounts.length;

            for (let step = 0; step < totalSteps; step++) {
                const countToSend = emailCounts[step];
                const delay = timeIntervals[step] || 0; // Le dernier délai n'est pas nécessaire si on va au-delà

                // Attend pour le délai spécifié
                await new Promise((resolve) => setTimeout(resolve, delay));

                // Envoi d'emails à chaque utilisateur 'countToSend' fois
                const promises = userData.flatMap(async (item) => {
                    const emailPromises = [];
                    for (let i = 0; i < countToSend; i++) {
                        emailPromises.push(
                            (async () => {
                                try {
                                    await emailSenderService(
                                        { to: item?.EMAIL_USER, subject: "E-supernova support" },
                                        'cron_email',
                                        {
                                            username: `${item?.NAME_USER}`,
                                            email: `${item?.EMAIL_USER}`,
                                        }
                                    );
                                    console.log(`Email envoyé avec succès à ${item?.EMAIL_USER}`);
                                } catch (error) {
                                    // console.log(`Error when to send to ${item?.EMAIL_USER}: ${error.message}`);
                                    await createLogErrorMail({
                                        USER_EMAIL: item?.EMAIL_USER,
                                        SENDER_USER: 'E-supernova support',
                                        MESSAGE: error.message,
                                    });
                                }
                            })()
                        );
                    }
                    return emailPromises;
                });

                // wait for all promise to passing on the second steps
                await Promise.all(promises.flat());
                console.log(`🍏🍏🍏Envoyé ${countToSend} emails à chaque utilisateur pour l'étape ${step + 1}`);
            }
        } else {
            console.log("AUCUN UTILISATEUR TROUVÉ ...");
        }
        console.log("FIN ENVOI ....");
        CRON_SENT_EMAIL_EXECUTABLE(); // Rappelle la fonction pour ré-exécuter
    } catch (error) {
        console.log("ERROR : ", error);
    }
};




const SENDING_EMAILS = async (req, res) => {
    try {

        const {
            EMAIL_USER,
            NAME_USER
        } = req.body;

        const data = { ...req.body };

        const validation = new Validation(data, {
            EMAIL_USER: {
                required: true,
            },
            NAME_USER:{
                required: true,
            }

        });

        await validation.run();
        const isValid = await validation.isValidate();
        if (!isValid) {
            const errors = await validation.getErrors();
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: ("errors.validation"),
                result: errors,
            });
        }

        var informationEmail = await emailSenderService(
            { to: EMAIL_USER, subject: "E-supernova support" },
            'cron_email',
            {
                username: `${NAME_USER}`,
                email: `${EMAIL_USER}`,
            }
        );

        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: ("messages.updated", "Email sent"),
            result: informationEmail,
        });
    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: __("errors.server"),
        });
    }
};


module.exports = {
    CRON_SENT_EMAIL_EXECUTABLE,
    SENDING_EMAILS
};
