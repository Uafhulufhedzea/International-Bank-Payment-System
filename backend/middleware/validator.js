
// input whitening Server-side RegEx validation
// This middleware validates all registration input on the server
// using strict RegEx whitelist patterns. Only expected characters
// and formats are allowed through blocking injection attacks
// like SQL injection and XSS at the API entry point.
// Applied as Express middleware beofre the route handler executes.

const validateRegistration = (req, res, next) => {
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;      // Alphanumeric only, 3-20 chars
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;            // Letters and spaces only
    const idRegex = /^\d{6,13}$/;                       // Digits only, 6-13 chars (SA ID = 13)
    const accountRegex = /^\d{6,12}$/;                  // Digits only, 6-12 chars

    const { username, fullName, idNumber, accountNumber } = req.body;

    if (!usernameRegex.test(username)) return res.status(400).json({ error: "Invalid Username: only alphanumeric characters allowed" });
    if (!nameRegex.test(fullName)) return res.status(400).json({ error: "Invalid Full Name: only letters and spaces allowed" });
    if (!idRegex.test(idNumber)) return res.status(400).json({ error: "Invalid ID Number: must be 6-13 digits" });
    if (!accountRegex.test(accountNumber)) return res.status(400).json({ error: "Invalid Account Number: must be 6-12 digits" });

    next();
};

module.exports = { validateRegistration };
