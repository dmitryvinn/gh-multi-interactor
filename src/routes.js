const express = require('express');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const ghApi = require("./scripts/gh-api.js");

const router = express.Router();
const { check, validationResult, matchedData } = require('express-validator');

const SHOULD_CLOSE_VALUE = "close";

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
  check('items')
    .isLength({ min: 1 })
    .withMessage('GH Item(s) should be specified')
    .trim(),
  check("repo")
  .contains('/')
  .withMessage("Repo should be in a format 'orgName/repoName'")
  .trim(),
  check('comment')
  .trim(),
  check("shouldClose"),
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
    processGhItems(data);
    req.flash('success', `Thank you using the tool - your GH Items are now processed (#${data.items.split(",")})`);
    res.redirect('/');
});

/**
 * Processes GitHub Items
 * @param data GH Items
 */
function processGhItems(data) {
    const repoArgs = data.repo.split("/");
    const orgName = repoArgs[0];
    const repoName = repoArgs[1];

    ghApi.processItems(
      data.apiToken,
      orgName,
      repoName,
      data.items.split(","),
      SHOULD_CLOSE_VALUE === data.shouldClose,
      data.comment
    );
}

module.exports = router;
