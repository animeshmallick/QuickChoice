function isSameDay(date1, date2){
    return (date1.getFullYear()===date2.getFullYear() && date1.getMonth()===date2.getMonth() && date1.getDate()===date2.getDate());
}

function calculateStreak(streakDate){
    const dates=streakDate;
    let streak=0;
    let current =new Date();
    if(!isSameDay(current, dates[0])) current.setDate(current.getDate()-1);
    for(const dateStr of dates){
        const date =new Date(dateStr);
        if(isSameDay(date, current)){
            current.setDate(current.getDate()-1);
            streak++;
        }
        else break;
    }
    return streak;
}

module.exports = {calculateStreak};