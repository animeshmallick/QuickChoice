class StoreOpenHelper{
    isOpen(open_time, close_time){
        const time = new Date();
        const current_time = time.toTimeString().split(' ')[0];
        let isOpen = false;
        if (open_time <= close_time) {// Same day
            isOpen = current_time >= open_time && current_time <= close_time;
        } else {// Crosses midnight
            isOpen = current_time >= open_time || current_time <= close_time;
        }
        return isOpen;
    }
}
module.exports = new StoreOpenHelper();