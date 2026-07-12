function isAssignmentDue(dueAtStr) {
    const dueAtDate = new Date(dueAtStr);
    const currentDate = new Date(); 
    return dueAtDate <= currentDate;
}
