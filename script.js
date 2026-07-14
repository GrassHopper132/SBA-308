
function isAssignmentDue(dueAtStr) {
    const dueAtDate = new Date(dueAtStr);
    const currentDate = new Date();
    return dueAtDate <= currentDate;
}

function calculateFinalScore(submission, assignment) {
    const dueDate = new Date(assignment.due_at);
    const submissionDate = new Date(submission.submitted_at);
    let finalScore = submission.score;
    const latePenaltyRate = 0.10;
    const isLate = submissionDate > dueDate;

    if (isLate) {
        finalScore -= assignment.points_possible * latePenaltyRate;
    } else {
        finalScore = Math.max(0, finalScore);
    }

    return Math.max(0, finalScore);
}

function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
    if (assignmentGroup.course_id !== courseInfo.id) {
        throw new Error('Data Validation Error: Assignment group course ID (${assignmentGroup.course_id}) does not match Course Info ID (${courseInfo.id}).');
    }

    const dueAssignments = assignmentGroup.assignments.filter((assignment) => {
        if (assignment.points_possible === 0 || typeof assignment.points_possible !== "number") {
            throw new Error('Invalid Data Error: Assignment ID ${assignment.id} has invalid points_possible (${assignment.points_possible}).');
        }
        return isAssignmentDue(assignment.due_at);
    });

    const studentMap = {};

    learnerSubmissions.forEach((submissionRecord) => {
        const matchAssignment = dueAssignments.find((assignment) => assignment.id === submissionRecord.assignment_id);

        if (!matchAssignment) {
            return;
        }

        const learnerId = submissionRecord.learner_id;

        if (!studentMap[learnerId]) {
            studentMap[learnerId] = {
                id: learnerId,
                totalPointsEarned: 0,
                totalPointsPossible: 0,
                scores: {}
            };
        }

        try {
            const pointsEarned = calculateFinalScore(submissionRecord.submission, matchAssignment);
            const pointsPossible = matchAssignment.points_possible;
            const scoreRatio = pointsPossible > 0 ? pointsEarned / pointsPossible : 0;

            studentMap[learnerId].scores[matchAssignment.id] = scoreRatio;
            studentMap[learnerId].totalPointsEarned += pointsEarned;
            studentMap[learnerId].totalPointsPossible += pointsPossible;
        } catch (error) {
            console.error('Skipping submission calculation due to error: ${error.message}');
        }
    });

    const results = [];

    for (const student of Object.values(studentMap)) {
        const averageScore = student.totalPointsPossible > 0
            ? student.totalPointsEarned / student.totalPointsPossible
            : 0;

        const result = {
            id: student.id,
            avg: averageScore,
            ...student.scores
        };

        if (result.avg < 0.9) {
            continue;
        }

        results.push(result);
    }

    return results;
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
    console.log("SUCCESSFULLY PROCESSED DATA:", JSON.stringify(result, null, 2));
} catch (error) {
    console.error("CRITICAL PROCESSING ERROR CAUGHT:", error.message);
}
