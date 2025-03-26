const { Op } = require('sequelize');
const CensusBlock = require('../models/census_block/Census_block');

async function filterCensusBlocks() {
    const blocks = await CensusBlock.findAll({
        where: {
            population_density: { [Op.gt]: 100 } // plus de densiter
        }
    });
    return blocks; 
}

module.exports = {
    filterCensusBlocks,
};