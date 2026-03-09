export const getTodayDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return new Date().toLocaleDateString('en-US', options);
};

export const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Hi';
    if (hour < 18) return 'Hi';
    return 'Hi';
};
