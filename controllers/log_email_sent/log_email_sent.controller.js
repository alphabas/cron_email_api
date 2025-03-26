const express = require("express");
const Recensement = require("../../models/recensement/Recensement");
const { Op } = require("sequelize");
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS");
const censusService = require('../../services/censusService');
const industryService = require('../../services/industryService');
const Census_block = require("../../models/census_block/Census_block");
const Indistry_category = require("../../models/indistry_category/Indistry_category");

const findAll = async (req, res) => {
  try {
    const { rows = 10, first = 0, sortField, sortOrder, search, latitude, longitude } = req.query;

    const defaultSortField = "name";
    const defaultSortDirection = "ASC";
    const sortColumns = {
      recensement: {
        as: "recensement",
        fields: {
          id: "id",
          name: "name",
          adress: "adress",
          date_created: "date_created",
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
      orderColumn = sortColumns.recensement.fields.id;
      sortModel = {
        model: "recensement",
        as: sortColumns.recensement,
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


    const globalSearchColumns = ["name", "adress", "date_created"];
    const findLatLong = ["latitude", "longitude"];

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

    var filterDensity = {}
    var filterLat = {}
    var filterLong = {}

    if (latitude && latitude.trim() != "") {
      filterLat = {
        latitude : {[Op.substring]: latitude},
      };
    }

    if (longitude && longitude.trim() != "") {
      filterLong = {
        longitude : {[Op.substring]: longitude},
      };
    }

    // filterDensity = {
    //   "$census_block.population_density$": { [Op.gt]: 100 },
    // }

    const result = await Recensement.findAndCountAll({
      limit: parseInt(rows),
      offset: parseInt(first),
      order: [[sortModel, orderColumn, orderDirection]],
      where: {
        ...globalSearchWhereLike,
        ...filterDensity,
        ...filterLat,
        ...filterLong
      },
      include: [
        {
          model: Census_block,
          as: "census_block",
          required: false,
          attributes: ["id_census", "name_census", "population_density"]
        },
        {
          model: Indistry_category,
          as: "indistry_category",
          required: false,
          attributes: ["id_indistry_category", "name_indistry_category"]
        }
      ],
      group: ['recensement_cityzen.name'], 
      distinct: true
    });

    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "List request",
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



const deleteItems = async (req, res) => {
  try {
    const { ids } = req.body;
    const id = JSON.parse(ids);



    await Recensement.destroy({
      where: {
        id
      },
    });

    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "Data deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
      statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
      httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
      message: "Erreur interne du serveur, réessayer plus tard",
    });
  }
};


const generateQueries = async (req, res) => {
  try {
    const blocks = await censusService.filterCensusBlocks();
    const categories = await industryService.getRelevantIndustryCategories();

    const queries = [];
    for (const block of blocks) {
      for (const category of categories) {
        queries.push({ "block_name": block.name_census, "category_name": category.name_indistry_category });
      }
    }
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: "Categorie query generated, 100 density pop and 5000 category get",
      result: queries,
    });
    // res.json(queries); 
  } catch (error) {
    console.log(error);
    res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
      statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
      httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
      message: "Server Error Intern , Try again later",
    });
    // res.status(500).send('Erreur lors de la génération des requêtes');
  }
}

module.exports = {
  deleteItems,
  findAll,
  generateQueries
};