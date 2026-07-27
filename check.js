const fs = require('fs');
const html = fs.readFileSync('attendance_page_dump.html', 'utf8');

// The file contains:
// <td>21CSC303J</td>
// <td>SOFTWARE ENGINEERING AND PROJECT MANAGEMENT</td>
// <td>85.00</td>

// Wait, the scraped_attendance_debug.json had:
// "courseCode": "21CSC303J"
// "classesHeld": 21
// "classesAttended": null
// "percentage": 80
// Where did this come from?
console.log(fs.readFileSync('scraped_attendance_debug.json', 'utf8'));
