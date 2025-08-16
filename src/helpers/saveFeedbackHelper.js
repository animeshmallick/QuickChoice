function removeDuplicatePayloads(payloads){
    const seen = new Set();
    return payloads.filter(payload => {
        if(payload.rating<0 || payload.rating>5) return false;
        if(!payload.id) return false;
        if(seen.has(payload.id)) return false;
        seen.add(payload.id);
        return true;
    });
}

module.exports = {removeDuplicatePayloads};