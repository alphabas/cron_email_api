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

// ******* SCHEDULE CRON EXEC ***********

const CRON_SENT_EMAIL_EXECUTABLE_SCHEDULE = () => {
    var delayInMilliseconds = 30000;
    var interval = setInterval(() => {
        clearInterval(interval);
        cron_emails_schedule();
    }, delayInMilliseconds);
};


// ******* CRON SENT EMAIL ONE MULTIPLE EXECUTABLE ***********


const CRON_SENT_EMAIL_ONE_MULTIPLE_EXECUTABLE = () => {
    var delayInMilliseconds = 30000;
    var interval = setInterval(() => {
        clearInterval(interval);
        cron_emails_for_multiple_users();
    }, delayInMilliseconds);
};



async function currentUsers() {
    try {
        const responseData = await Users.findAll();
        return responseData;
    } catch (error) {
        console.log("ERROR TO GET USERS.... :", error);
        throw error;
    }
}


//  =================> CRON TO SENDING ONE OR MULTIPLE MESSAGES FOR MANY USERS < ===========

const cron_emails_for_multiple_users = async (res, req) => {
    try {
        console.log("✅☑☑===> START CRONS MULTIPLE USERS <==== ☑☑☑");
        const userData = await currentUsers();
        if (userData && userData.length > 0) {
            const emailCounts = [10, 20];
            const timeIntervals = [5 * 60 * 1000, 10 * 60 * 1000];
            const totalSteps = emailCounts.length;

            for (let step = 0; step < totalSteps; step++) {
                const countToSend = emailCounts[step];
                const delay = timeIntervals[step] || 0;

                await new Promise((resolve) => setTimeout(resolve, delay));

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
                                    console.error(`Erreur lors de l'envoi à ${item?.EMAIL_USER}: ${error.message}`);
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

                await Promise.all(promises.flat());
                console.log(`Envoyé ${countToSend} emails à chaque utilisateur pour l'étape ${step + 1}`);
            }
        } else {
            console.log("USES NOT FOUND ...");
        }
        console.log("END TO SENDING ....");
        CRON_SENT_EMAIL_ONE_MULTIPLE_EXECUTABLE(); 
    } catch (error) {
        console.log("ERROR : ", error);
    }
};



// ==================> API FONCTION CRON TO SHARE MULTIPLES MESSAGE FOR MANY USERS SCHEDULE <================ //

const cron_emails_schedule = async (res, req) => {
    try {
        console.log(" ✅✅===> START CRONS SCHEDULE <====");
        const userData = await currentUsers();
        if (userData && userData.length > 0) {
            const totalDaysSteps = 30; // Total steps corresponding to 30 days
            const initialEmailCount = 5; // Initial number of emails to be sent

            // Créez les intervalles pour 30 jours
            const timeIntervals = [];
            for (let day = 0; day < totalDaysSteps; day++) {
                timeIntervals.push(day === 0 ? 1 * 60 * 1000 : (day * 24 * 60 * 60 * 1000)); // 1 min pour le premier envoi, puis tous les jours
            }

            for (let step = 0; step < totalDaysSteps; step++) {
                const countToSend = initialEmailCount + (step * 5); // Augmente de 5 pour chaque étape
                const delay = timeIntervals[step]; // Délai spécifié

                // Attendre pour le délai spécifié
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
                                    console.log(`Email successfully sent to ${item?.EMAIL_USER}`);
                                } catch (error) {
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
                // Attendre que toutes les promesses soient résolues
                await Promise.all(promises.flat());
                console.log(`🍏🍏🍏Envoyé ${countToSend} emails à chaque utilisateur pour l'étape ${step + 1}`);
            }
        } else {
            console.log("USERS NOT FOUND ...");
        }
        console.log("END TO SENDING ....");
        // Rappelle la fonction pour ré-exécuter si nécessaire
        CRON_SENT_EMAIL_EXECUTABLE_SCHEDULE(); 
    } catch (error) {
        console.log("ERROR : ", error);
    }
};


// ==================> API FOR SENDING ONE EMAIL MESSAGE <================ //

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
            NAME_USER: {
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
            message: "ERROR TO CONNEXION",
        });
    }
};


module.exports = {
    CRON_SENT_EMAIL_EXECUTABLE_SCHEDULE,
    CRON_SENT_EMAIL_ONE_MULTIPLE_EXECUTABLE,
    SENDING_EMAILS
};
