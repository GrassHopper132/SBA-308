function isAssignmentDue(dueAtStr) {
    const dueAtDate = new Date(dueAtStr);
    const currentDate = new Date(); 
    return dueAtDate <= currentDate;
}
function calculateFinalScore(submission, assignment) {
    const dueDate = new Date(assignment.due_at);
    const submissionDate = new Date(submission.submitted_at);
let finalScore = submission.score;
    
    
    if (submissionDate > dueDate) {
        
        finalScore -= (assignment.points_possible * 0.10);
    }
    
    
    return Math.max(0, finalScore);
}
function getLearnerData(CourseInfo, AssignmentGroup, LearnerSubmissions) {
    
    if (AssignmentGroup.course_id !== CourseInfo.id) {
        throw new Error(`Data Validation Error: Assignment group course ID (${AssignmentGroup.course_id}) does not match Course Info ID (${CourseInfo.id}).`);
    }

    
    const dueAssignments = AssignmentGroup.assignments.filter(assignment => {
        
        if (assignment.points_possible === 0 || typeof assignment.points_possible !== "number") {
            throw new Error(`Invalid Data Error: Assignment ID ${assignment.id} has invalid points_possible (${assignment.points_possible}).`);
        }
        return isAssignmentDue(assignment.due_at);
    });

    
    const studentMap = {};

    
    LearnerSubmissions.forEach(sub => {
        
        const matchAssignment = dueAssignments.find(asg => asg.id === sub.assignment_id);
        
        
        if (!matchAssignment) return;

        const learnerId = sub.learner_id;

        
        if (!studentMap[learnerId]) {
            studentMap[learnerId] = {
                id: learnerId,
                totalPointsEarned: 0,
                totalPointsPossible: 0,
                scores: {}
            };
        }

        try {
            
            const pointsEarned = calculateFinalScore(sub.submission, matchAssignment);
            const pointsPossible = matchAssignment.points_possible;

            
            studentMap[learnerId].scores[matchAssignment.id] = pointsEarned / pointsPossible;

            
            studentMap[learnerId].totalPointsEarned += pointsEarned;
            studentMap[learnerId].totalPointsPossible += pointsPossible;
        } catch (error) {
            console.error(`Skipping submission calculation due to error: ${error.message}`);
        }
    });
