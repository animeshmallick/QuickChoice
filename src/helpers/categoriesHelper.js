class CategoryHelper {
    parseCategoryResult(products) {
        const result = {};
        products.forEach(product => {
            const header = product.category_header;
            const category = product.category;

            if (!result[header]) {
                result[header] = new Set();
            }
            result[header].add(category);
        });
        Object.keys(result).forEach(header => {
            result[header] = Array.from(result[header]).map(cat => ({ category: cat, image: cat+".png" }));
        });
        return result;
    }
}
module.exports = new CategoryHelper();