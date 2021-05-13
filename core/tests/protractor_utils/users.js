// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for user creation, login and privileging when
 * carrying out end-to-end testing with protractor.
 */

var FirebaseAdmin = require('firebase-admin');
var HashWasm = require('hash-wasm');
var general = require('./general.js');
var waitFor = require('./waitFor.js');
var action = require('./action.js');
var AdminPage = require('./AdminPage.js');
var adminPage = new AdminPage.AdminPage();

var _createFirebaseAccount = async function(email, isSuperAdmin = false) {
  // The Firebase Admin SDK stores all emails in lower case. To ensure that the
  // developer email used to sign in is consistent with these accounts, we
  // manually change them to lower case.
  email = email.toLowerCase();
  var user = await FirebaseAdmin.auth().createUser({
    email: email,
    emailVerified: true,
    // We've configured the Firebase emulator to use email/password for user
    // authentication. To save developers and end-to-end test authors the
    // trouble of providing passwords, we always use the md5 hash of the email
    // address instead. This will never be done in production, where the
    // emulator DOES NOT run. Instead, production takes the user to the Google
    // sign-in page, which eventually redirects them back to Oppia.
    password: await HashWasm.md5(email),
  });
  if (isSuperAdmin) {
    await FirebaseAdmin.auth().setCustomUserClaims(
      user.uid, {role: 'super_admin'});
  }
};

// Logs in to Oppia through the interface provided by AuthService.signInAsync().
//
// Specifically, we pass the email argument into the prompt generated by
// signInAsync(), and then wait for the page to be redirected with login
// credentials.
//
// When manual navigation is enabled, the function will explicitly redirect the
// browser to the login page. If disabled, then the function will assume that
// the browser is already on the login page.
var login = async function(email, useManualNavigation = true) {
  if (useManualNavigation) {
    await browser.get(general.SERVER_URL_PREFIX + general.LOGIN_URL_SUFFIX);
  }

  var loginPage = element(by.css('.protractor-test-login-page'));
  await waitFor.presenceOf(loginPage, 'Login page did not load');

  var emailInput = element(by.css('.protractor-test-sign-in-email-input'));
  await action.sendKeys('Email input', emailInput, email);

  var signInButton = element(by.css('.protractor-test-sign-in-button'));
  await action.click('Sign in button', signInButton);

  await waitFor.pageToFullyLoad();
};

var logout = async function() {
  await browser.get(general.SERVER_URL_PREFIX + general.LOGOUT_URL_SUFFIX);
  // Wait for logout page to load.
  await waitFor.pageToFullyLoad();
  // Wait for redirection to occur.
  await waitFor.pageToFullyLoad();
};

// The user needs to log in immediately before this method is called. Note
// that this will fail if the user already has a username.
var _completeSignup = async function(username) {
  await waitFor.pageToFullyLoad();

  var signupPage = element(by.css('.protractor-test-signup-page'));
  await waitFor.presenceOf(signupPage, 'Signup page did not load');

  var usernameInput = element(by.css('.protractor-test-username-input'));
  await action.sendKeys('Username input', usernameInput, username);

  var agreeToTermsCheckbox = (
    element(by.css('.protractor-test-agree-to-terms-checkbox')));
  await action.click('Agree to terms checkbox', agreeToTermsCheckbox);

  var registerUser = element(by.css('.protractor-test-register-user'));
  await action.click('Register user button', registerUser);

  await waitFor.pageToFullyLoad();
};

var createAndLoginUser = async function(
    email, username, useManualNavigation = true) {
  await _createFirebaseAccount(email);
  await login(email, useManualNavigation);
  await _completeSignup(username);
};

var createAndLoginAdminUser = async function(email, username) {
  await _createFirebaseAccount(email, true);
  await login(email);
  await _completeSignup(username);
  await adminPage.get();
  await adminPage.updateRole(username, 'admin');
};

var createAndLoginAdminUserMobile = async function(email, username) {
  await _createFirebaseAccount(email, true);
  await login(email);
  await _completeSignup(username);
};

var createAdminMobile = async function(email, username) {
  await createAndLoginAdminUserMobile(email, username);
  await logout();
};

var createUser = async function(email, username) {
  await createAndLoginUser(email, username);
  await logout();
};

var createModerator = async function(email, username) {
  await _createFirebaseAccount(email, true);
  await login(email);
  await _completeSignup(username);
  await adminPage.get();
  await adminPage.updateRole(username, 'moderator');
  await logout();
};

var createAdmin = async function(email, username) {
  await createAndLoginAdminUser(email, username);
  await logout();
};

var isAdmin = async function() {
  return await element(by.css('.protractor-test-admin-text')).isPresent();
};

exports.isAdmin = isAdmin;
exports.login = login;
exports.logout = logout;
exports.createUser = createUser;
exports.createAndLoginUser = createAndLoginUser;
exports.createModerator = createModerator;
exports.createAdmin = createAdmin;
exports.createAndLoginAdminUser = createAndLoginAdminUser;
exports.createAdminMobile = createAdminMobile;
exports.createAndLoginAdminUserMobile = createAndLoginAdminUserMobile;
