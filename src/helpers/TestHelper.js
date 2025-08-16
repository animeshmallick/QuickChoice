const util = require("util");
const Sql = require("../resource/sql.js");
class TestHelper {
    mock_data_key = Object.freeze({
        CATEGORIES: {name: 'categories.json', sql_query: Sql.get_all_categories()},
        CART_WITH_PRODUCTS_1: {name: 'cart_with_1_products.json', sql_query: Sql.get_all_products_in_stock_from_ids([1])},
        CART_WITH_PRODUCTS_2: {name: 'cart_with_2_products.json', sql_query: Sql.get_all_products_in_stock_from_ids([1,2])},
        PING: {name: 'ping.json'},
        UNAUTHORIZED: {name: 'unauthorized.json'},
        PRODUCTS_FROM_CATEGORY: {name: 'productsFromCategory.json', sql_query: Sql.get_products_from_category('Dairy')},
        PRODUCTS_WHEN_CATEGORY_INVALID: {name: 'emptyProductsFromCategory.json', sql_query: Sql.get_products_from_category('Invalid')},
        PRODUCT: {name: 'product.json', sql_query:Sql.get_product_from_productId(3)},
        INVALID_PRODUCT: {name: 'emptyProduct.json', sql_query:Sql.get_product_from_productId('')},
        SIMILAR_PRODUCTS: {name: 'similarProducts.json', sql_query:Sql.get_all_products()},
        LOGIN: {name: 'login.json'},
        NO_USERS_FOUND: {name: 'noUserFound.json'},
        NO_ADDRESS_FOUND: {name: 'noAddressFound.json'},
        ADDRESS_FOUND: {name: 'userAddress.json'},
        ALL_PRODUCTS: {name: 'all_products.json', sql_query: Sql.get_all_products()},
        USER_ADDRESS_ADDED_SUCCESSFULLY: {name: 'userAddressAddedSuccessfully.json'},
        WRONG_ADDRESS_DETAILS: {name: 'wrongAddressDetails.json'},
        USER_REGISTERED_SUCCESSFULLY: {name: 'userRegisteredSuccessfully.json'},
        INVALID_USER_REGISTRATION_DETAILS: {name: 'invalidUserRegistration.json'},
        ADMIN_LOGIN_SUCCESSFUL: {name: 'adminLoginSuccessful.json'},
        INVALID_ADMIN_LOGIN_CREDENTIALS: {name: 'invalidAdminLoginCredentials.json'},
        PURCHASE_DETAILS: {name: 'purchaseDetails.json'}
    });
    get_mock_data(mock_date_file_name){
        return require(util.format(`../mock_data/${mock_date_file_name}`));
    }
    get_sql_mock_data(sql_mock_data_file_name){
        return require(util.format(`../../test/resource/mock_data/sql_mock_data/${sql_mock_data_file_name}`));
    }
}
module.exports = new TestHelper();