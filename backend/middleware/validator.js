const validateRegistration = (req, res, next) => {
    const usernameRegex = /^[a-zA-Z0-9]{3,20}$/;
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const numberRegex = /^\d+$/; // Only digits for ID and Account

    const { username, fullName, idNumber, accountNumber } = req.body;

    if (!usernameRegex.test(username)) return res.status(400).json({ error: "Invalid Username" });
    if (!nameRegex.test(fullName)) return res.status(400).json({ error: "Invalid Full Name" });
    if (!numberRegex.test(idNumber)) return res.status(400).json({ error: "ID must be numbers only" });
    if (!numberRegex.test(accountNumber)) return res.status(400).json({ error: "Account must be numbers only" });

    next();
};

module.exports = { validateRegistration };
