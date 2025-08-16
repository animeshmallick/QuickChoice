const sql = require('../src/resource/sql'); // Update path as needed

describe('Sql Class', () => {

    describe('get_all_categories', () => {
        it('should return correct SQL for all categories', () => {
            const query = sql.get_all_categories();
            expect(query.length > 0).toEqual(true);
        });
    });

    describe('get_products_from_category', () => {
        it('should return correct SQL for a valid category', () => {
            const query = sql.get_products_from_category('Electronics');
            expect(query.length > 0).toEqual(true);
        });

        it('should throw error for non-string category', () => {
            expect(() => sql.get_products_from_category(123)).toThrow('Invalid category');
        });
    });

    describe('get_all_products_from_ids', () => {
        it('should return correct SQL for valid ids', () => {
            const query = sql.get_all_products_in_stock_from_ids([1, 2, 3]);
            expect(query.length > 0).toEqual(true);
        });

        it('should throw error if ids is not an array', () => {
            expect(() => sql.get_all_products_in_stock_from_ids('not-an-array')).toThrow('Invalid ids');
        });

        it('should throw error if ids array is empty', () => {
            expect(() => sql.get_all_products_in_stock_from_ids([])).toThrow('Invalid ids');
        });

        it('should throw error if ids array contains non-numeric value', () => {
            expect(() => sql.get_all_products_in_stock_from_ids([1, 'a', 3])).toThrow('Invalid id in list');
        });
    });
});
