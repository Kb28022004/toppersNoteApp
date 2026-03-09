export const getTopPerformingSubject = (salesData) => {
    if (!salesData?.notes || salesData.notes.length === 0) return null;

    const subjectSales = {};
    salesData.notes.forEach(note => {
        if (note.subject) {
            subjectSales[note.subject] = (subjectSales[note.subject] || 0) + (note.totalSales || 0);
        }
    });

    const sortedSubjects = Object.entries(subjectSales)
        .sort((a, b) => b[1] - a[1])
        .filter(entry => entry[1] > 0);

    if (sortedSubjects.length === 0) return null;

    const topSubject = sortedSubjects[0][0];
    const secondSubject = sortedSubjects.length > 1 ? sortedSubjects[1][0] : null;

    if (secondSubject) {
        return `${topSubject} and ${secondSubject} notes are currently trending.`;
    }
    return `${topSubject} notes are currently your top performers!`;
};
