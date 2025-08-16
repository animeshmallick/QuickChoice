class Sql {
    get_all_categories() {
        return "SELECT * FROM categories;";
    }

    get_products_from_category(category) {
        if (typeof category !== 'string') {
            throw new Error('Invalid category');
        }
        const safeCategory = category.replace(/'/g, "''");
        const query = `SELECT * FROM products WHERE category='${safeCategory}' AND enabled = TRUE;`;
        
        return query;
    }
    get_all_products_from_ids(ids){
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Invalid ids');
        }
        const numericIds = ids.map(id => {
            if (typeof id !== 'number' && isNaN(Number(id))) {
                throw new Error('Invalid id in list');
            }
            return Number(id);
        });
        const query = `SELECT * FROM products WHERE id IN (${numericIds.join(',')});`;

        return query;
    }

    get_all_products_in_stock_from_ids(ids) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Invalid ids');
        }
        const numericIds = ids.map(id => {
            if (typeof id !== 'number' && isNaN(Number(id))) {
                throw new Error('Invalid id in list');
            }
            return Number(id);
        });
        const query = `SELECT * FROM products WHERE id IN (${numericIds.join(',')}) AND stock > 0;`;
        
        return query;
    }

    get_product_from_productId(productId) {
        const query = `SELECT * FROM products WHERE id = '${productId}';`;
        
        return query;
    }

    get_all_products(){
        const query = `SELECT * FROM products WHERE enabled = TRUE;`;
        
        return query;
    }

    check_product_in_database(product) {
        const query = `SELECT COUNT(*) as 'length' FROM products where name = '${product.name}' and 
                                    category = '${product.category}' and subcategory = '${product.subcategory}' and 
                                    brand = '${product.brand}' and size = '${product.size}'`;
        
        return query;
    }

    add_new_product_to_db(product) {
      const query = `INSERT INTO products (name,category_header,category,subcategory,brand,sku,barcode,mrp,selling_price,stock,size,description,image_url,expiration_date,tags)
                            VALUES ('${product.name}','${product.category_header}','${product.category}','${product.subcategory}','${product.brand}','${product.sku}','${product.barcode}','${product.mrp}',
                                    '${product.selling_price}','${product.stock}','${product.size}','${product.description}','${product.imageUrls}','${product.expiration_date}','${product.tags}')`;
      
      return query;
    }

    get_user_address(userId){
        const query = `SELECT address_label, addr_line1, addr_line2, address_id, city, pincode, state, isDefault FROM addresses WHERE userid ='${userId}'`;
        
        return query;
    }
    verify_login_details(phonenumber,password){
        const query =`SELECT * FROM users WHERE phone='${phonenumber}' AND password='${password}'`;
        
        return query;
    }
    insertIntoOrdersTable(){
        const query = "INSERT INTO orders (order_id,product_id,quantity) VALUES ?";
        return query;
    }
    reduceInventory() {
        const query = `UPDATE products SET stock = stock - 1 WHERE id in (?)`;
        return query;
    }
    verify_address_belong_to_user(userId,address){
        const query = `SELECT * FROM addresses WHERE USERID ='${userId}' AND address_id ='${address}'`;
        return query;
    }
    insertIntoPurchaseTable(){
        const query = "INSERT INTO purchase (purchase_id, customer_id, address_id, order_id, status, payment_id, store_pickup) VALUES ?";
        return query;
    }
    get_purchase_details(pid){
        const query = `SELECT * FROM purchase where purchase_id ='${pid}'`;
        return query;
    }
    get_all_purchase(date){
        const query = `SELECT * FROM purchase where purchase_id LIKE 'PID-${date}%-%'`;
        return query;
    }
    get_user_address_query() {
        return "SELECT * FROM addresses WHERE address_id = ?"
    }
    get_user_phoneNumber_query() {
        return "SELECT phone FROM users WHERE userid = ?"
    }
    get_address(addressId){
        const query = `SELECT * FROM addresses WHERE address_id ='${addressId}'`;
        console.log(query);
        return query;
    }
    get_orders(order_ids) {
        const quoted_ids = order_ids.map(id => `'${id}'`);
        const query = `SELECT * FROM orders WHERE order_id IN (${quoted_ids.join(',')})`;
        return query;
    }
    add_new_address(customerId, address){
        const query = `INSERT INTO addresses(userid,address_id,address_label,addr_line1,addr_line2,city,pincode,state,isDefault) VALUES ('${customerId}','${address.address_id}','${address.address_label}','${address.addr_line1}','${address.addr_line2}','${address.city}','${address.pincode}','${address.state}',false)`;
        console.log(query);
        return query;
    }
    get_purchase_status(pid){
        const query = `SELECT status FROM purchase WHERE purchase_id='${pid}';`;
        console.log(query);
        return query;
    }
    change_purchase_status(pid, status) {
        const query = `UPDATE purchase
                       SET status='${status}'
                       WHERE purchase_id = '${pid}';`;
        console.log(query);
        return query;
    }
    get_user_purchases(customerId){
        const query = `SELECT p.id, p.customer_id, p.address_id, p.order_id, p.status, p.payment_id, p.placed_on, p.purchase_id,SUM(o.quantity) AS total_quantity FROM purchase as p JOIN orders as o ON p.order_id REGEXP CONCAT('(^|&&)', o.order_id, '($|&&)') WHERE p.customer_id = '${customerId}' GROUP BY p.purchase_id`;
        console.log(query);
        return query;
    }
    get_user_profile(customer_id){
        const query = `SELECT fname,lname, phone from users where userid='${customer_id}';`;
        console.log(query);
        return query;
    }
    get_user_password(customer_id) {
        const query = `SELECT userid , password from users where userid='${customer_id}';`;
        console.log(query);
        return query;
    }
    update_user_password(customer_id, newPassword) {
        const query = `UPDATE users SET \`password\`='${newPassword}' WHERE userid='${customer_id}';`;
        console.log(query);
        return query;
    }
    get_last_userid() {
        const query = `SELECT MAX(id) AS max_id from users;`
        console.log(query);
        return query;
    }
    verify_phone_number(phoneNumber){
        const query = `SELECT userid FROM users where phone='${phoneNumber}'`;
        console.log(query);
        return query;
    }
    register_user(userRegistrationDetails, userid){
        const query = `INSERT INTO users(userid,fname,lname,phone,password,email,isAdmin) VALUES ('${userid}','${userRegistrationDetails.fname}','${userRegistrationDetails.lname}','${userRegistrationDetails.phone}','${userRegistrationDetails.password}','${userRegistrationDetails.email}','0');`;
        console.log(query);
        return query;
    }
    get_store_address() {
        const query = "SELECT * from store_master_data;";
        console.log(query);
        return query;
    }
    get_store_timings(){
        const query = `SELECT opening_time, closing_time FROM store_master_data;`;
        console.log(query);
        return query;
    }
    change_store_timings(open_time, close_time){
        const query = `UPDATE store_master_data SET opening_time = '${open_time}', closing_time = '${close_time}' WHERE store_id = 'STR001';`;
        console.log(query);
        return query;
    }
    get_last_purchases(customer_id){
        const query = `SELECT customer_id, purchase_id, order_id, placed_on FROM purchase WHERE customer_id = '${customer_id}' ORDER BY placed_on DESC LIMIT 10;`;
        console.log(query);
        return query;
    }
    get_order_count_from_customer_id(customer_id){
        const query = `SELECT COUNT(*) AS total FROM purchase WHERE customer_id = '${customer_id}' AND DATE(placed_on) = CURDATE();`
        console.log(query);
        return query;
    }

    set_default_address(customer_id, address_id){
      const query = `UPDATE addresses SET isDefault = CASE WHEN address_id = '${address_id}' THEN 1 ELSE 0 END WHERE userid = '${customer_id}';`;
      console.log(query);
      return query;
    }

    update_feedback_rating(productId, new_rating){
        const query = `UPDATE products SET rating = ((rating*rating_count) + '${new_rating}')/(rating_count+1), rating_count=rating_count+1 WHERE id = '${productId}';`
        console.log(query);
        return query;
    }
}

module.exports = new Sql();
