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

    
    return Object.values(studentMap).map(student => {
        
        const averageScore = student.totalPointsPossible > 0 
            ? (student.totalPointsEarned / student.totalPointsPossible) 
            : 0;

        return {
            id: student.id,
            avg: averageScore,
            ...student.scores 
        };
    });
}


try {
    const course = { id: 451, name: "Introduction to JavaScript" };
    
    const group = {
        id: 1,
        name: "Fundamentals",
        course_id: 451, 
        assignments: [
            { id: 101, name: "Variables", due_at: "2023-01-01", points_possible: 100 },
            { id: 102, name: "Loops", due_at: "2023-01-15", points_possible: 200 },
            { id: 103, name: "Future Project", due_at: "2028-12-31", points_possible: 500 } 
        ]
    };

    const submissions = [
        { learner_id: 125, assignment_id: 101, submission: { submitted_at: "2023-01-02", score: 90 } }, 
        { learner_id: 125, assignment_id: 102, submission: { submitted_at: "2023-01-14", score: 180 } }, 
        { learner_id: 125, assignment_id: 103, submission: { submitted_at: "2024-01-01", score: 500 } },
        { learner_id: 132, assignment_id: 101, submission: { submitted_at: "2023-01-01", score: 100 } } 
    ];

    const result = getLearnerData(course, group, submissions);
    console.log("SUCCESSFULLY PROCESSED DATA:", result);

} catch (err) {
    console.error("CRITICAL PROCESSING ERROR CAUGHT:", err.message);
}
// SUCCESSFULLY PROCESSED DATA: 
[
  { '101': 0.8, '102': 0.9, id: 125, avg: 0.8666666666666667 },
  { '101': 1, id: 132, avg: 1 }
]
    
