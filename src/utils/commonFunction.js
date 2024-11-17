

const setexpiry = (minutes) => {
    const d1 = new Date();
    const d2 = new Date(d1);
    return d2.setMinutes(d1.getMinutes() + minutes);
};

module.exports = {
    setexpiry
}