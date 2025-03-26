const IndustryCategory = require('../models/indistry_category/Indistry_category');

async function getRelevantIndustryCategories() {
    const categories = await IndustryCategory.findAll({
        limit: 5000 
    });
    return categories;
}

module.exports = {
    getRelevantIndustryCategories,
};