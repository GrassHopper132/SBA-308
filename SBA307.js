function isAssignmentDue(dueAtStr) {
    const dueAtDate = new Date(dueAtStr);
    const currentDate = new Date(); 
    return dueAtDate <= currentDate;
}
function calculateFinalScore(submission, assignment) {
    const dueDate = new Date(assignment.due_at);
    const submissionDate = new Date(submission.submitted_at);
