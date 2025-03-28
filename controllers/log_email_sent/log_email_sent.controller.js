const express = require("express");
const { Op } = require("sequelize");
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS");
const Log_email_sent = require("../../models/log_email_sent/Log_email_sent");

const findAll = async (req, res) => {
  try {
    const { rows = 10, first = 0, sortField, sortOrder, search, } = req.query;

    const defaultSortField = "USER_EMAIL";
    const defaultSortDirection = "ASC";
    const sortColumns = {
      log_email_sent: {
        as: "log_email_sent",
        fields: {
          ID_LOG: "ID_LOG",
          USER_EMAIL: "USER_EMAIL",
          SENDER_USER: "SENDER_USER",
          DATE_SENT: "DATE_SENT",
        },
      },

    };

    var orderColumn, orderDirection;

    // sorting
    var sortModel;
    if (sortField) {
      for (let key in sortColumns) {
        if (sortColumns[key].fields.hasOwnProperty(sortField)) {
          sortModel = {
            model: key,
            as: sortColumns[key].as,
          };
          orderColumn = sortColumns[key].fields[sortField];
          break;
        }
      }
    }
    if (!orderColumn || !sortModel) {
      orderColumn = sortColumns.log_email_sent.fields.ID_LOG;
      sortModel = {
        model: "log_email_sent",
        as: sortColumns.log_email_sent,
      };
    }
    // ordering
    if (sortOrder == 1) {
      orderDirection = "ASC";
    } else if (sortOrder == -1) {
      orderDirection = "DESC";
    } else {
      orderDirection = defaultSortDirection;
    }


    const globalSearchColumns = ["SENDER_USER", "USER_EMAIL", "DATE_SENT"];

    var globalSearchWhereLike = {};
    if (search && search.trim() != "") {
      const searchWildCard = {};
      globalSearchColumns.forEach((column) => {
        searchWildCard[column] = {
          [Op.substring]: search,
        };
      });
      globalSearchWhereLike = {
        [Op.or]: searchWildCard,
      };
    }


    const result = await Log_email_sent.findAndCountAll({
      limit: parseInt(rows),
      offset: parseInt(first),
      order: [[sortModel, orderColumn, orderDirection]],
      where: {
        ...globalSearchWhereLike,
      
      },
 
    });

    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "List for error mails",
      result: {
        data: result.rows,
        totalRecords: result.count,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
      statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
      httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
      message: "Server Error Intern , Try again later",
    });
  }
};



const createLogErrorMail = async (currentData) => {
  try {
    const { USER_EMAIL, SENDER_USER, MESSAGE } = currentData;

    const logItems = await Log_email_sent.create({
      USER_EMAIL,
      SENDER_USER,
      MESSAGE,
    });

    return logItems;
  } catch (error) {
    console.error(error);
    throw new Error("ERROR LOG...");
  }
};


module.exports = {
  findAll,
  createLogErrorMail
};