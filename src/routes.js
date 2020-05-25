const express = require('express');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const issues = require("./scripts/index.js");

const router = express.Router();
const { check, validationResult, matchedData } = require('express-validator');


router.get('/', csrfProtection, (req, res) => {
  res.render('index', {
    data: {},
    errors: {},
    csrfToken: req.csrfToken()
  });
});

router.post('/', csrfProtection, [
  check('apiToken')
    .isLength({ min: 1 })
    .withMessage('Api Token is required'),
  check('issues')
    .isLength({ min: 1 })
    .withMessage('Issue(s) should be specified')
    .trim(),
  check("repo")
  .contains('/')
  .withMessage("Repo should be in a format 'orgName/repoName'")
  .trim(),
  check('comment')
  .trim()
], (req, res) => {
   const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("index", {
        data: req.body,
        errors: errors.mapped(),
        csrfToken: req.csrfToken()
      });
    }

    const data = matchedData(req);
    console.log(data);
    issues.processIssues(data.apiToken, data.repo, data.issues.split(','), data.comment);
    req.flash('success', 'Thank you using the tool - your GH issues are now closed');
    res.redirect('/');
});

module.exports = router;
